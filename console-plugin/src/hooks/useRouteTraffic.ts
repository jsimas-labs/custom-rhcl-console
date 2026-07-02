import * as React from 'react';
import {
  K8sResourceCommon,
  consoleFetch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  HTTPRouteGVK,
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
} from '../models';
import { HTTPRoute } from '../types/httproute';
import { primaryTargetRef } from '../utils/policyTargets';
import {
  RouteTrafficRow,
  SparklinePoint,
} from '../components/overview/types';
import { usePollingEffect } from './usePollingEffect';

// route_name in Istio metrics is "<routeNamespace>.<routeName>.<ruleIndex>"
// when the gateway is OSSM-managed. The ruleIndex is a small integer; we
// strip it off to map back to the HTTPRoute the row represents.
function parseRouteName(routeName: string): { namespace: string; name: string } | undefined {
  const m = /^([^.]+)\.(.+)\.([0-9]+)$/.exec(routeName);
  if (!m) return undefined;
  return { namespace: m[1], name: m[2] };
}

const RPM_BY_ROUTE =
  'sum by (route_name) (rate(istio_requests_total{reporter="source", route_name!=""}[5m])) * 60';
const ERROR_PCT_BY_ROUTE =
  '100 * sum by (route_name) ' +
  '(rate(istio_requests_total{reporter="source", response_code=~"5..", route_name!=""}[5m])) ' +
  '/ sum by (route_name) ' +
  '(rate(istio_requests_total{reporter="source", route_name!=""}[5m]))';
const SPARKLINE_BY_ROUTE =
  'sum by (route_name) (rate(istio_requests_total{reporter="source", route_name!=""}[2m]))';

interface PerRouteStats {
  rpm: number;
  errorPct: number;
  sparkline: SparklinePoint[];
}

interface RouteAggregate {
  // Keyed by `<namespace>/<name>` — multiple route_name series share the
  // same HTTPRoute (one per rule index), so we sum across rule indices.
  [key: string]: PerRouteStats;
}

interface UseRouteTrafficResult {
  rows: RouteTrafficRow[];
  loaded: boolean;
}

/**
 * Per-HTTPRoute operational summary for the Overview "HTTPRoutes" table.
 *
 * Watches every HTTPRoute in the cluster and joins it with three
 * Prometheus aggregates keyed by `route_name`:
 *   - requests/min (instant)
 *   - error rate %  (instant)
 *   - 12-point sparkline (range, last 30 min, 150s step)
 *
 * route_name carries the rule index (`.N` suffix) so we strip it and sum
 * the per-rule rates back onto the parent HTTPRoute. The dashboard's
 * `route_name` label only exists once the istio Telemetry CR has been
 * applied with the `xds.route_name` tagOverride — see the
 * `project-telemetry-targetrefs-gotcha` memory for the gotcha.
 *
 * Sort: highest RPM first (matches operational intuition of "the busy
 * routes first").
 */
export function useRouteTraffic(): UseRouteTrafficResult {
  const [routes, rtLoaded] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });
  const [authP, authLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
  });
  const [rlp, rlpLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const [trlp, trlpLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
  });
  const [dnsP, dnsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [tlsP, tlsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
  });

  const [agg, setAgg] = React.useState<RouteAggregate>({});
  const [aggLoaded, setAggLoaded] = React.useState(false);

  usePollingEffect(
    async (signal) => {
      try {
        // 2 instant queries + 1 range query.
        const now = Math.floor(Date.now() / 1000);
        const start = now - 1800;
        const step = 150;

        const [rpmJson, errJson, sparkJson] = await Promise.all([
          consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(RPM_BY_ROUTE)}`,
            { signal },
            10_000,
          ).then((r) => r.json()),
          consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(ERROR_PCT_BY_ROUTE)}`,
            { signal },
            10_000,
          ).then((r) => r.json()),
          consoleFetch(
            `/api/prometheus/api/v1/query_range?` +
              new URLSearchParams({
                query: SPARKLINE_BY_ROUTE,
                start: String(start),
                end: String(now),
                step: String(step),
              }).toString(),
            { signal },
            15_000,
          ).then((r) => r.json()),
        ]);

        if (signal.aborted) return;

        const next: RouteAggregate = {};
        const merge = (key: string, patch: Partial<PerRouteStats>): void => {
          const prev: PerRouteStats = next[key] || { rpm: 0, errorPct: 0, sparkline: [] };
          next[key] = { ...prev, ...patch };
        };

        for (const row of rpmJson?.data?.result || []) {
          const parsed = parseRouteName(row?.metric?.route_name);
          const v = parseFloat(row?.value?.[1]) || 0;
          if (!parsed) continue;
          const key = `${parsed.namespace}/${parsed.name}`;
          merge(key, { rpm: (next[key]?.rpm || 0) + v });
        }

        // Weighted error rate across rule indices for the same route would
        // require carrying the request count alongside — for the Overview
        // we approximate by taking the max error rate observed across the
        // route's rules, which mirrors "if any rule is bleeding, the row
        // shows it" and avoids understating problems.
        for (const row of errJson?.data?.result || []) {
          const parsed = parseRouteName(row?.metric?.route_name);
          const v = parseFloat(row?.value?.[1]);
          if (!parsed || !Number.isFinite(v)) continue;
          const key = `${parsed.namespace}/${parsed.name}`;
          merge(key, { errorPct: Math.max(next[key]?.errorPct || 0, v) });
        }

        // Sparkline: sum across rule indices (12 points). Aligned to the
        // first series' timestamps so we don't have to bucket.
        const buckets: Record<string, Map<number, number>> = {};
        for (const row of sparkJson?.data?.result || []) {
          const parsed = parseRouteName(row?.metric?.route_name);
          if (!parsed) continue;
          const key = `${parsed.namespace}/${parsed.name}`;
          const map = buckets[key] || new Map<number, number>();
          for (const [ts, val] of row?.values || []) {
            const t = Number(ts);
            const v = parseFloat(val) || 0;
            map.set(t, (map.get(t) || 0) + v);
          }
          buckets[key] = map;
        }
        for (const [key, map] of Object.entries(buckets)) {
          const points: SparklinePoint[] = [...map.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([, v], i) => ({ t: i, v }));
          merge(key, { sparkline: points });
        }

        setAgg(next);
        setAggLoaded(true);
      } catch {
        if (signal.aborted) return;
        setAggLoaded(true);
      }
    },
    [],
    { intervalMs: 60_000, enabled: true },
  );

  return React.useMemo<UseRouteTrafficResult>(() => {
    const loaded =
      rtLoaded && authLoaded && rlpLoaded && trlpLoaded && dnsLoaded && tlsLoaded && aggLoaded;

    const allPolicies = [
      ...(authP || []),
      ...(rlp || []),
      ...(trlp || []),
      ...(dnsP || []),
      ...(tlsP || []),
    ];

    const policyCountFor = (routeNs: string, routeName: string): number =>
      allPolicies.filter((p) => {
        const ref = primaryTargetRef(p);
        if (!ref) return false;
        if (ref.kind !== 'HTTPRoute') return false;
        const refNs = ref.namespace || p.metadata?.namespace;
        return refNs === routeNs && ref.name === routeName;
      }).length;

    const rows: RouteTrafficRow[] = (routes || []).map((r) => {
      const ns = r.metadata?.namespace || '';
      const name = r.metadata?.name || '';
      const key = `${ns}/${name}`;
      const stats = agg[key] || { rpm: 0, errorPct: 0, sparkline: [] };

      // First parent ref kind=Gateway, if any.
      const parent = (r.spec?.parentRefs || []).find((p) => !p.kind || p.kind === 'Gateway');
      const gatewayName = parent?.name || '';

      return {
        id: `rt-${ns}-${name}`,
        name,
        namespace: ns,
        gatewayName,
        requestsPerMin: Math.round(stats.rpm),
        errorRatePct: Math.round(stats.errorPct * 10) / 10,
        policiesCount: policyCountFor(ns, name),
        sparkline: stats.sparkline,
        href: `/k8s/ns/${ns}/gateway.networking.k8s.io~v1~HTTPRoute/${name}`,
      };
    });

    rows.sort((a, b) => b.requestsPerMin - a.requestsPerMin);
    return { rows, loaded };
  }, [routes, authP, rlp, trlp, dnsP, tlsP, agg, rtLoaded, authLoaded, rlpLoaded, trlpLoaded, dnsLoaded, tlsLoaded, aggLoaded]);
}
