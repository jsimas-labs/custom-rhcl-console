import * as React from 'react';
import {
  useK8sWatchResource,
  useK8sWatchResources,
  WatchK8sResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { HTTPRoute, HTTPBackendRef } from '../types/httproute';
import { EndpointSlice, ResolvedBackend, Service } from '../types/backends';
import { EndpointSliceGVK, ServiceGVK } from '../models';

interface UseBackendsStatusResult {
  backends: ResolvedBackend[];
  loaded: boolean;
}

/**
 * Resolve every `backendRef` declared on an HTTPRoute against the live
 * Kubernetes API and report what the data plane sees.
 *
 * Three signals are joined:
 *
 *  1. **HTTPRoute `status.parents[].conditions[ResolvedRefs]`** — what the
 *     gateway controller observed at last reconcile. Closest thing the
 *     route itself says about its backends.
 *  2. **Service watch** — does the Kubernetes Service actually exist
 *     right now? May briefly disagree with (1) under churn; we surface
 *     both so the UI can show the inconsistency.
 *  3. **EndpointSlice watch** — the real list of pods serving the
 *     Service. We count `conditions.ready === true` endpoints. This is
 *     as close as the K8s API gets to "the backend is alive" without
 *     making an HTTP probe.
 *
 * We use `useK8sWatchResources` (plural) for the EndpointSlice list per
 * backendRef because each backendRef may target a different namespace
 * (cross-namespace HTTPRoute backends are legal under Gateway API and
 * land more often as the spec matures).
 *
 * Returns one `ResolvedBackend` per `(rule, backendRef)` pair — we keep
 * duplicate Service references separate so the UI can show weighting
 * per-rule when the same Service appears under multiple rules with
 * different weights.
 */
export function useBackendsStatus(route: HTTPRoute | undefined): UseBackendsStatusResult {
  const routeNamespace = route?.metadata?.namespace || '';

  // Flatten all backendRefs across rules. Memoising on `route` identity is
  // not enough because useK8sWatchResource returns a NEW object on every
  // status update (including the route's status.parents heartbeats),
  // which would re-key the watch maps every few seconds and force the
  // SDK to tear down + recreate every Service/EndpointSlice watch — the
  // exact "watch spam against the K8s API" pattern we're trying to avoid.
  //
  // Stabilise on the *content* of backendRefs by serialising to a key
  // string and memoising the parsed array on that key.
  const refsKey = React.useMemo(() => {
    const flat = (route?.spec?.rules || []).flatMap((r) => r.backendRefs || []);
    // Only the fields we read downstream matter for stability.
    return flat
      .map((r) => `${r.namespace || ''}/${r.name}:${r.port ?? ''}:${r.weight ?? 1}`)
      .join('|');
  }, [route]);
  const refs = React.useMemo<HTTPBackendRef[]>(() => {
    return (route?.spec?.rules || []).flatMap((r) => r.backendRefs || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refsKey]);

  // Build the watch map for Services. Each key is `<ns>/<name>` so duplicates
  // across rules collapse into one watch.
  const serviceWatches: WatchK8sResources<Record<string, Service>> = React.useMemo(() => {
    const map: WatchK8sResources<Record<string, Service>> = {};
    for (const ref of refs) {
      const ns = ref.namespace || routeNamespace;
      const key = `${ns}/${ref.name}`;
      if (!map[key]) {
        map[key] = {
          groupVersionKind: ServiceGVK,
          namespace: ns,
          name: ref.name,
        };
      }
    }
    return map;
  }, [refs, routeNamespace]);

  // EndpointSlices for each Service — list watch in the Service's namespace,
  // filtered by the standard `kubernetes.io/service-name` label.
  const endpointSliceWatches: WatchK8sResources<Record<string, EndpointSlice[]>> = React.useMemo(() => {
    const map: WatchK8sResources<Record<string, EndpointSlice[]>> = {};
    for (const ref of refs) {
      const ns = ref.namespace || routeNamespace;
      const key = `${ns}/${ref.name}`;
      if (!map[key]) {
        map[key] = {
          groupVersionKind: EndpointSliceGVK,
          namespace: ns,
          isList: true,
          selector: { matchLabels: { 'kubernetes.io/service-name': ref.name } },
        };
      }
    }
    return map;
  }, [refs, routeNamespace]);

  const serviceResults = useK8sWatchResources<Record<string, Service>>(serviceWatches);
  const endpointSliceResults = useK8sWatchResources<Record<string, EndpointSlice[]>>(endpointSliceWatches);

  // ResolvedRefs from the route's status. The gateway controller writes one
  // RouteParentStatus per accepted parentRef; we look across all parents and
  // OR the condition. If ANY parent says ResolvedRefs=True, treat as resolved.
  const routeResolvedRefs: boolean | null = React.useMemo(() => {
    const parents = route?.status?.parents;
    if (!parents || parents.length === 0) return null;
    return parents.some((p) =>
      p.conditions?.some((c) => c.type === 'ResolvedRefs' && c.status === 'True'),
    );
  }, [route]);

  const loaded = React.useMemo(() => {
    if (!route) return false;
    return (
      areAllLoaded(serviceResults) && areAllLoaded(endpointSliceResults)
    );
  }, [route, serviceResults, endpointSliceResults]);

  const backends: ResolvedBackend[] = React.useMemo(() => {
    if (!loaded) return [];
    return refs.map((ref) => {
      const ns = ref.namespace || routeNamespace;
      const key = `${ns}/${ref.name}`;
      const svcResult = serviceResults[key];
      const sliceResult = endpointSliceResults[key];
      const service = (svcResult?.data as Service | undefined) || null;
      const slices = (sliceResult?.data as EndpointSlice[] | undefined) || [];

      let ready = 0;
      let total = 0;
      const podNames: string[] = [];
      for (const slice of slices) {
        for (const ep of slice.endpoints || []) {
          total++;
          if (ep.conditions?.ready === true) ready++;
          if (ep.targetRef?.kind === 'Pod' && ep.targetRef.name) {
            podNames.push(ep.targetRef.name);
          }
        }
      }

      return {
        name: ref.name,
        namespace: ns,
        port: ref.port,
        weight: ref.weight ?? 1,
        resolvedRefs: routeResolvedRefs,
        serviceFound: !!service,
        service,
        readyEndpoints: ready,
        totalEndpoints: total,
        podNames,
      };
    });
  }, [loaded, refs, routeNamespace, serviceResults, endpointSliceResults, routeResolvedRefs]);

  return { backends, loaded };
}

// Shared helper — `useK8sWatchResources` returns a map of
// `{[key]: {data, loaded, loadError}}`. Consumer code wants a single boolean.
// Typed loosely because the SDK's WatchK8sResults generic is tied to
// `ResourcesObject` and our `Record<string, T>` doesn't always satisfy it
// directly; we only need to read `.loaded`/`.loadError` here.
type LoadableEntry = { loaded?: boolean; loadError?: unknown };
function areAllLoaded(results: Record<string, LoadableEntry>): boolean {
  const entries = Object.values(results);
  if (entries.length === 0) return true; // empty input == done
  return entries.every((r) => !!r.loaded || !!r.loadError);
}

// Re-export the single-resource hook so consumers that already have a Service
// in hand don't need to wire useK8sWatchResources themselves.
export { useK8sWatchResource };
