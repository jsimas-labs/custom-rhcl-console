import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DNSPolicyGVK,
  DNSRecordGVK,
  GatewayGVK,
  HTTPRouteGVK,
} from '../../models';
import { DnsFlow, DnsStep, DnsTimelineEvent, StepStatus } from './types';

/**
 * The DNS troubleshooting page's single source of truth. Watches the
 * three CRs the flow depends on (DNSPolicy, Gateway, HTTPRoute) plus
 * recent Events, then joins them by hostname to produce a `DnsFlow`
 * snapshot that every visual component reads from.
 *
 * Design notes:
 *
 *   - **One hostname at a time.** The page's dropdown swaps the input;
 *     the hook re-derives everything from the same watches — no extra
 *     API calls per selection.
 *
 *   - **We don't try to probe public DNS from the browser.** JavaScript
 *     has no DNS API. A production build would call a small server-side
 *     prober; the resolver table currently ships derived-from-state +
 *     honest placeholders. Comment in DNSResolverTable calls this out.
 *
 *   - **Backend health is derived from HTTPRoute.status.parents ready
 *     conditions.** Fetching Endpoints for every backendRef would be
 *     another watch × N routes; the operator can drill into the
 *     Backends card on the Overview for real endpoint state.
 */

interface DNSPolicyResource extends K8sResourceCommon {
  spec?: {
    targetRef?: { group?: string; kind?: string; name?: string };
    providerRefs?: Array<{ name?: string }>;
  };
  status?: {
    conditions?: Array<{
      type?: string;
      status?: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>;
    /** Per-record status Kuadrant surfaces once records are written. */
    recordConditions?: Record<string, unknown>;
  };
}

interface GatewayResource extends K8sResourceCommon {
  spec?: {
    listeners?: Array<{ name?: string; hostname?: string; port?: number; protocol?: string }>;
  };
  status?: {
    conditions?: Array<{
      type?: string;
      status?: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>;
    listeners?: Array<{ name?: string; supportedKinds?: Array<{ kind?: string }> }>;
    addresses?: Array<{ value?: string }>;
  };
}

interface HTTPRouteResource extends K8sResourceCommon {
  spec?: {
    hostnames?: string[];
    parentRefs?: Array<{ name?: string; namespace?: string; sectionName?: string }>;
    rules?: Array<{ backendRefs?: Array<{ name?: string; port?: number }> }>;
  };
  status?: {
    parents?: Array<{
      parentRef?: { name?: string; namespace?: string };
      conditions?: Array<{
        type?: string;
        status?: string;
        reason?: string;
        message?: string;
        lastTransitionTime?: string;
      }>;
    }>;
  };
}

interface EventResource extends K8sResourceCommon {
  reason?: string;
  message?: string;
  type?: string; // Normal | Warning
  eventTime?: string;
  lastTimestamp?: string;
  involvedObject?: { kind?: string; name?: string; namespace?: string };
}

interface DNSRecordEndpoint {
  dnsName?: string;
  recordType?: string;
  targets?: string[];
  recordTTL?: number;
  /** Kuadrant stamps `labels.owner=<hash>` on every endpoint entry it
   *  writes. In multi-site setups the same hosted zone accumulates
   *  entries from multiple clusters — one owner per cluster. The
   *  presence of >1 distinct owner in `status.endpoints[].labels.owner`
   *  is the tell that a record is co-owned. */
  labels?: Record<string, string>;
  providerSpecific?: Array<{ name?: string; value?: string }>;
}

interface DNSRecordResource extends K8sResourceCommon {
  spec?: {
    /** The hostname this record covers — Kuadrant reuses the Gateway
     *  listener hostname here so matching by string is exact. */
    rootHost?: string;
    endpoints?: DNSRecordEndpoint[];
  };
  status?: {
    conditions?: Array<{
      type?: string;
      status?: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>;
    /** When the provider last acknowledged the record. */
    queuedAt?: string;
    /** Ownership tag Kuadrant stamps for multi-owner shared zones. */
    ownerID?: string;
    /** Provider-merged view — one entry per (owner, target) tuple in
     *  multi-site setups. This is the field we mine for co-ownership. */
    endpoints?: DNSRecordEndpoint[];
  };
}

function conditionStatus(
  conds: Array<{ type?: string; status?: string; message?: string }> | undefined,
  type: string,
): { ok: boolean; message?: string } | null {
  const c = (conds || []).find((x) => x.type === type);
  if (!c) return null;
  return { ok: c.status === 'True', message: c.message };
}

/** Best-effort match: a Gateway "covers" a hostname when any listener
 *  hostname is equal to it, ends with the same DNS suffix (wildcard
 *  case), or the gateway has no explicit hostname on any listener (a
 *  wildcard-anything catch-all). */
function gatewayHandlesHostname(gw: GatewayResource, hostname: string): boolean {
  const listeners = gw.spec?.listeners || [];
  if (listeners.length === 0) return false;
  return listeners.some((l) => {
    if (!l.hostname) return true;
    if (l.hostname === hostname) return true;
    if (l.hostname.startsWith('*.') && hostname.endsWith(l.hostname.slice(1))) return true;
    return false;
  });
}

/** Provider inferred from the DNSPolicy's providerRefs Secret name. The
 *  Kuadrant CRD doesn't carry the provider kind on the CR — the Secret
 *  it points at does. This is a heuristic on the Secret name that
 *  covers the three providers we care about; users on something exotic
 *  see "Custom provider" and the details row spells out the Secret. */
function inferProvider(secretName: string | undefined): { label: string; hosted?: string } {
  if (!secretName) return { label: 'Not configured' };
  const s = secretName.toLowerCase();
  if (s.includes('aws') || s.includes('route53')) return { label: 'AWS Route 53' };
  if (s.includes('gcp') || s.includes('google')) return { label: 'Google Cloud DNS' };
  if (s.includes('azure')) return { label: 'Azure DNS' };
  return { label: `Custom (${secretName})` };
}

/**
 * Pick the step to blame for the operator's current problem — the
 * first step that isn't healthy, walking left-to-right. Steps that
 * are "not-configured" don't fault-in until we hit something earlier
 * that _is_ configured, so an empty-cluster case doesn't scream
 * "Backend failing" when the real answer is "no DNSPolicy exists yet".
 */
function pickPrimaryFailure(steps: DnsStep[]): DnsStep | null {
  const badStates: StepStatus[] = ['failing', 'warning', 'pending'];
  for (const s of steps) {
    if (badStates.includes(s.status)) return s;
  }
  const notConfigured = steps.find((s) => s.status === 'not-configured');
  return notConfigured || null;
}

function worstStatus(steps: DnsStep[]): StepStatus {
  const priority: StepStatus[] = ['failing', 'warning', 'pending', 'not-configured', 'skipped', 'healthy'];
  for (const p of priority) {
    if (steps.some((s) => s.status === p)) return p;
  }
  return 'healthy';
}

/**
 * The mock-resolver ladder used by DNSResolverTable. Real production
 * status would come from a prober service; we mirror the input flow
 * status here so the table isn't obviously stale. The idea is: if the
 * cluster-side DNS record is "pending", most public resolvers are
 * likely still returning NXDOMAIN, one might be catching up.
 */
export function useDnsTroubleshooting(selectedHostname: string | null): DnsFlow {
  const [dnsPolicies, dnsPoliciesLoaded] = useK8sWatchResource<DNSPolicyResource[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [gateways, gatewaysLoaded] = useK8sWatchResource<GatewayResource[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });
  const [routes, routesLoaded] = useK8sWatchResource<HTTPRouteResource[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });
  const [events, eventsLoaded] = useK8sWatchResource<EventResource[]>({
    groupVersionKind: { version: 'v1', kind: 'Event' },
    isList: true,
  });
  const [dnsRecords, dnsRecordsLoaded] = useK8sWatchResource<DNSRecordResource[]>({
    groupVersionKind: DNSRecordGVK,
    isList: true,
  });

  return React.useMemo<DnsFlow>(() => {
    const loading = !dnsPoliciesLoaded || !gatewaysLoaded || !routesLoaded || !eventsLoaded || !dnsRecordsLoaded;

    // Every listener hostname across every Gateway becomes an option.
    // Ignore wildcards ("*.foo.bar") from the dropdown — those are
    // fine as coverage but useless as a debug target.
    const hostnameSet = new Set<string>();
    for (const gw of gateways || []) {
      for (const l of gw.spec?.listeners || []) {
        if (l.hostname && !l.hostname.startsWith('*.')) hostnameSet.add(l.hostname);
      }
    }
    for (const r of routes || []) {
      for (const h of r.spec?.hostnames || []) {
        if (h && !h.startsWith('*.')) hostnameSet.add(h);
      }
    }
    const hostnameOptions = [...hostnameSet].sort();
    const hostname = selectedHostname || hostnameOptions[0] || '';

    // Match a Gateway to the hostname.
    const gateway = (gateways || []).find((g) => gatewayHandlesHostname(g, hostname)) || null;
    const gatewayName = gateway?.metadata?.name || '';
    const gatewayNs = gateway?.metadata?.namespace || '';

    // Match a DNSPolicy to that gateway.
    const dnsPolicy =
      (dnsPolicies || []).find(
        (p) =>
          p.spec?.targetRef?.kind === 'Gateway' &&
          p.spec?.targetRef?.name === gatewayName,
      ) || null;

    // Match an HTTPRoute to the hostname + gateway.
    const httpRoute =
      (routes || []).find(
        (r) =>
          (r.spec?.hostnames || []).some((h) => h === hostname) &&
          (r.spec?.parentRefs || []).some((p) => p.name === gatewayName),
      ) || null;

    // ------- HOSTNAME step -------
    const hostnameStep: DnsStep = {
      id: 'hostname',
      title: 'Hostname',
      resourceName: hostname || 'no hostname selected',
      status: hostname ? 'healthy' : 'not-configured',
      summary: hostname
        ? 'Hostname is declared on a Gateway or HTTPRoute.'
        : 'No hostname declared on any Gateway or HTTPRoute yet.',
      details: hostname
        ? [
            { label: 'Hostname', value: hostname },
            { label: 'Source', value: gateway ? 'Gateway listener' : httpRoute ? 'HTTPRoute spec' : 'Unknown' },
          ]
        : [],
    };

    // ------- DNSPOLICY step -------
    const dnsPolicyAccepted = conditionStatus(dnsPolicy?.status?.conditions, 'Accepted');
    const dnsPolicyEnforced = conditionStatus(dnsPolicy?.status?.conditions, 'Enforced');
    const dnsPolicyStep: DnsStep = {
      id: 'dnspolicy',
      title: 'DNSPolicy',
      resourceName: dnsPolicy?.metadata?.name,
      namespace: dnsPolicy?.metadata?.namespace,
      status: !dnsPolicy
        ? 'not-configured'
        : dnsPolicyAccepted?.ok && dnsPolicyEnforced?.ok
        ? 'healthy'
        : dnsPolicyAccepted?.ok
        ? 'pending'
        : 'failing',
      summary: !dnsPolicy
        ? 'No DNSPolicy is targeting the Gateway that serves this hostname.'
        : dnsPolicyAccepted?.ok && dnsPolicyEnforced?.ok
        ? 'Policy is accepted and enforced by Kuadrant.'
        : dnsPolicyAccepted?.ok
        ? 'Accepted but not yet enforced.'
        : `Not accepted: ${dnsPolicyAccepted?.message || 'unknown reason'}`,
      details: dnsPolicy
        ? [
            { label: 'Accepted', value: dnsPolicyAccepted?.ok ? 'True' : 'False' },
            { label: 'Enforced', value: dnsPolicyEnforced?.ok ? 'True' : 'False' },
            {
              label: 'Provider Secret',
              value: dnsPolicy.spec?.providerRefs?.[0]?.name || '(not set)',
              muted: !dnsPolicy.spec?.providerRefs?.[0]?.name,
            },
          ]
        : [],
      href: dnsPolicy?.metadata?.name
        ? `/k8s/ns/${dnsPolicy.metadata.namespace}/kuadrant.io~v1~DNSPolicy/${dnsPolicy.metadata.name}`
        : undefined,
    };

    // ------- GATEWAY step -------
    const gwProgrammed = conditionStatus(gateway?.status?.conditions, 'Programmed');
    const gwAccepted = conditionStatus(gateway?.status?.conditions, 'Accepted');
    const gatewayStep: DnsStep = {
      id: 'gateway',
      title: 'Gateway',
      resourceName: gatewayName,
      namespace: gatewayNs,
      status: !gateway
        ? 'not-configured'
        : gwProgrammed?.ok && gwAccepted?.ok
        ? 'healthy'
        : gwAccepted?.ok
        ? 'pending'
        : 'failing',
      summary: !gateway
        ? 'No Gateway advertises this hostname.'
        : gwProgrammed?.ok && gwAccepted?.ok
        ? 'Gateway is programmed and accepting traffic.'
        : gwAccepted?.ok
        ? 'Accepted but not yet programmed.'
        : `Not accepted: ${gwAccepted?.message || 'unknown reason'}`,
      details: gateway
        ? [
            { label: 'Listeners', value: String((gateway.spec?.listeners || []).length) },
            {
              label: 'External address',
              value: gateway.status?.addresses?.[0]?.value || '(none)',
              muted: !gateway.status?.addresses?.[0]?.value,
            },
            { label: 'Programmed', value: gwProgrammed?.ok ? 'True' : 'False' },
          ]
        : [],
      href: gateway
        ? `/connectivity-link/gateways/${gatewayNs}/${gatewayName}`
        : undefined,
    };

    // ------- PROVIDER step -------
    // Prefer real DNSRecord CR state over inferring from DNSPolicy
    // conditions — DNSRecord.Ready == True is the authoritative signal
    // that the provider (Route 53 / CloudDNS / Azure DNS) acknowledged
    // the write. Falls back to the DNSPolicy inference when no matching
    // DNSRecord exists (older Kuadrant, or the operator picked a
    // hostname that no policy is publishing for).
    const providerRefName = dnsPolicy?.spec?.providerRefs?.[0]?.name;
    const providerInfo = inferProvider(providerRefName);
    const matchingRecord = (dnsRecords || []).find(
      (r) =>
        r.spec?.rootHost === hostname ||
        (r.spec?.endpoints || []).some((e) => e.dnsName === hostname),
    );
    const recordReady = conditionStatus(matchingRecord?.status?.conditions, 'Ready');
    const endpointCount = matchingRecord?.spec?.endpoints?.length ?? 0;
    // ---- Multi-site / co-ownership detection ----
    //
    // Kuadrant tags every endpoint entry the DNSPolicy writes with a
    // `labels.owner=<hash>` — one owner per cluster contributing to the
    // hosted zone. In single-cluster setups status.endpoints carries a
    // single owner. In multi-site the same hosted zone accumulates
    // endpoints from every cluster's DNSPolicy, and the provider merges
    // them into a weighted / geo record set.
    //
    // We collect distinct owner ids from status.endpoints and pull out
    // "ours" via status.ownerID when set (otherwise infer as the owner
    // on any endpoint whose targets match spec.endpoints). Peers count
    // = distinct owners − ours.
    const statusEndpoints = matchingRecord?.status?.endpoints || [];
    const ownerIds = new Set<string>();
    for (const e of statusEndpoints) {
      const o = e.labels?.owner;
      if (o) ownerIds.add(o);
    }
    const ourOwnerId =
      matchingRecord?.status?.ownerID ||
      (() => {
        const ourTargets = new Set(
          (matchingRecord?.spec?.endpoints || []).flatMap((e) => e.targets || []),
        );
        const ourEndpoint = statusEndpoints.find((e) =>
          (e.targets || []).some((t) => ourTargets.has(t)),
        );
        return ourEndpoint?.labels?.owner || null;
      })();
    const peerOwners = [...ownerIds].filter((o) => o !== ourOwnerId);
    const isMultiSite = peerOwners.length > 0;
    // Distinct targets across ALL owners — used as "N public endpoints
    // total" in the details grid so the operator sees the merged view
    // count, not just what THIS cluster contributed.
    const mergedTargetCount = new Set(statusEndpoints.flatMap((e) => e.targets || [])).size;
    const providerStep: DnsStep = {
      id: 'provider',
      title: 'DNS Provider',
      resourceName: providerInfo.label,
      status: !dnsPolicy
        ? 'skipped'
        : !providerRefName
        ? 'failing'
        : matchingRecord
        ? recordReady?.ok
          ? 'healthy'
          : recordReady?.ok === false
          ? 'failing'
          : 'pending'
        : dnsPolicyEnforced?.ok
        ? 'healthy'
        : 'pending',
      summary: !dnsPolicy
        ? 'Skipped — no DNSPolicy is configured.'
        : !providerRefName
        ? 'DNSPolicy has no providerRefs — records will not be created.'
        : matchingRecord
        ? recordReady?.ok
          ? recordReady.message || 'Provider ensured the DNS record.'
          : recordReady?.ok === false
          ? `Provider rejected the record: ${recordReady.message || 'unknown reason'}`
          : 'DNSRecord created; waiting for the provider to acknowledge.'
        : dnsPolicyEnforced?.ok
        ? 'Records synced to provider.'
        : 'Waiting for the provider to acknowledge the records.',
      details: dnsPolicy
        ? [
            { label: 'Provider', value: providerInfo.label },
            { label: 'Secret', value: providerRefName || '(none)', muted: !providerRefName },
            { label: 'Hosted zone', value: hostname.split('.').slice(-2).join('.') || 'unknown' },
            {
              label: 'DNSRecord',
              value: matchingRecord?.metadata?.name || '(not created yet)',
              muted: !matchingRecord,
            },
            {
              label: 'Endpoints',
              value: matchingRecord
                ? isMultiSite
                  ? `${endpointCount} local · ${mergedTargetCount} merged`
                  : String(endpointCount)
                : '—',
              muted: !matchingRecord,
            },
            // Multi-site is important enough to earn its own row when
            // detected. Wording tries to avoid Kubernetes jargon: "N
            // clusters co-publishing" reads faster than
            // "peers on status.endpoints[].labels.owner".
            ...(isMultiSite
              ? [
                  {
                    label: 'Co-owners',
                    value: `${peerOwners.length} other cluster${peerOwners.length === 1 ? '' : 's'} co-publishing`,
                  },
                ]
              : []),
          ]
        : [],
      href: matchingRecord
        ? `/k8s/ns/${matchingRecord.metadata?.namespace}/kuadrant.io~v1alpha1~DNSRecord/${matchingRecord.metadata?.name}`
        : undefined,
    };

    // ------- PUBLIC DNS step -------
    // Cluster-side we know when the record was written (matchingRecord
    // Ready). Whether public resolvers actually see it needs the DNS
    // Prober companion (see DNSResolverTable). The card here reflects
    // the record-write status; the resolver preview below is the
    // authoritative real-time signal.
    const publicDnsStep: DnsStep = {
      id: 'public-dns',
      title: 'Public DNS',
      resourceName: 'Public resolvers',
      status: !dnsPolicy
        ? 'skipped'
        : matchingRecord && recordReady?.ok
        ? 'pending'
        : matchingRecord
        ? 'pending'
        : dnsPolicyEnforced?.ok
        ? 'pending'
        : 'not-configured',
      summary: !dnsPolicy
        ? 'Skipped — no records to propagate.'
        : matchingRecord && recordReady?.ok
        ? 'Record acknowledged by provider. See the resolver preview below for live per-resolver status.'
        : matchingRecord
        ? 'DNSRecord exists; waiting for provider before public resolvers see it.'
        : dnsPolicyEnforced?.ok
        ? 'Records were sent to the provider. See the resolver preview below for live per-resolver status.'
        : 'Records not yet written.',
      details: [],
    };

    // ------- HTTPROUTE step -------
    //
    // A single HTTPRoute can carry multiple entries in `status.parents`,
    // one per controller that reconciles it. On a Kuadrant-managed route
    // there are typically two:
    //   1. The Gateway API controller (Istio / envoy-gateway) — reports
    //      `Accepted` and `ResolvedRefs` — the canonical route health.
    //   2. `kuadrant.io/policy-controller` — reports only policy-affected
    //      conditions (DNSPolicyAffected, AuthPolicyAffected, ...) and
    //      does NOT emit Accepted/ResolvedRefs at all.
    //
    // Reading `parents[0]` blindly picked the Kuadrant parent on real
    // clusters, whose missing conditions read as "False" and painted the
    // step Failing even when the route was perfectly healthy. Iterate
    // all parents and combine with a permissive "any True wins" — if any
    // controller has accepted the route and resolved its refs, we're
    // good.
    const allParentConditions = (httpRoute?.status?.parents || []).flatMap(
      (p) => p.conditions || [],
    );
    const routeAcceptedTrue = allParentConditions.some(
      (c) => c.type === 'Accepted' && c.status === 'True',
    );
    const routeResolvedRefsTrue = allParentConditions.some(
      (c) => c.type === 'ResolvedRefs' && c.status === 'True',
    );
    const routeAcceptedFalse = allParentConditions.find(
      (c) => c.type === 'Accepted' && c.status === 'False',
    );
    const routeResolvedRefsFalse = allParentConditions.find(
      (c) => c.type === 'ResolvedRefs' && c.status === 'False',
    );
    const routeAccepted = routeAcceptedTrue
      ? { ok: true, message: 'True' }
      : routeAcceptedFalse
      ? { ok: false, message: routeAcceptedFalse.message || 'False' }
      : null;
    const routeResolvedRefs = routeResolvedRefsTrue
      ? { ok: true, message: 'True' }
      : routeResolvedRefsFalse
      ? { ok: false, message: routeResolvedRefsFalse.message || 'False' }
      : null;
    const httpRouteStep: DnsStep = {
      id: 'httproute',
      title: 'HTTPRoute',
      resourceName: httpRoute?.metadata?.name,
      namespace: httpRoute?.metadata?.namespace,
      status: !httpRoute
        ? 'not-configured'
        : routeAccepted?.ok && routeResolvedRefs?.ok
        ? 'healthy'
        : routeAccepted?.ok
        ? 'warning'
        : 'failing',
      summary: !httpRoute
        ? 'No HTTPRoute claims this hostname on the matching Gateway.'
        : routeAccepted?.ok && routeResolvedRefs?.ok
        ? 'Route is attached and its backendRefs resolve.'
        : routeAccepted?.ok
        ? `backendRefs not fully resolved: ${routeResolvedRefs?.message || ''}`
        : `Not accepted: ${routeAccepted?.message || ''}`,
      details: httpRoute
        ? [
            { label: 'Accepted', value: routeAccepted?.ok ? 'True' : 'False' },
            { label: 'ResolvedRefs', value: routeResolvedRefs?.ok ? 'True' : 'False' },
            { label: 'Backends', value: String((httpRoute.spec?.rules || []).reduce((n, r) => n + (r.backendRefs || []).length, 0)) },
          ]
        : [],
      href: httpRoute
        ? `/connectivity-link/httproutes/${httpRoute.metadata?.namespace}/${httpRoute.metadata?.name}`
        : undefined,
    };

    // ------- BACKEND step -------
    // Approximated from HTTPRoute.ResolvedRefs; the operator drills into
    // Backends on Overview for real endpoint state.
    const backendStep: DnsStep = {
      id: 'backend',
      title: 'Backend',
      resourceName: (httpRoute?.spec?.rules || [])
        .flatMap((r) => (r.backendRefs || []).map((b) => `${b.name || '?'}:${b.port || '?'}`))
        .slice(0, 2)
        .join(', ') || undefined,
      status: !httpRoute
        ? 'skipped'
        : routeResolvedRefs?.ok
        ? 'healthy'
        : routeAccepted === null
        ? 'unknown'
        : 'failing',
      summary: !httpRoute
        ? 'Skipped — no HTTPRoute to point at a backend.'
        : routeResolvedRefs?.ok
        ? 'All backend Services resolve; endpoints must be Ready.'
        : 'One or more backendRefs cannot be resolved to a Service in this namespace.',
      details: httpRoute
        ? [
            {
              label: 'Backend targets',
              value: String((httpRoute.spec?.rules || []).reduce((n, r) => n + (r.backendRefs || []).length, 0)),
            },
            {
              label: 'Endpoint readiness',
              value: 'derived from ResolvedRefs',
              muted: true,
            },
          ]
        : [],
    };

    const steps: DnsStep[] = [
      hostnameStep,
      dnsPolicyStep,
      gatewayStep,
      providerStep,
      publicDnsStep,
      httpRouteStep,
      backendStep,
    ];
    const overall = worstStatus(steps);
    const primaryFailure = pickPrimaryFailure(steps);

    // ------- Timeline -------
    //
    // Two data sources merged in chronological order:
    //
    //   1. `Event` objects with involvedObject pointing at any of the
    //      three CRs. This is the "loud" path — human-readable messages
    //      the controllers emit on important transitions.
    //   2. `status.conditions[].lastTransitionTime` on the three CRs.
    //      Fallback for quiet clusters where Kuadrant / Gateway API
    //      controllers don't spam Events but do carry accurate
    //      condition timestamps. Without this the timeline sat empty
    //      most of the time and the operator got a "reconciliation is
    //      idle" placeholder even when the CRs had clear history.
    //
    // Duplicates between the two sources (an Event AND a matching
    // condition transition emitted seconds apart) are fine — the
    // timeline is short enough that a couple of near-duplicate rows are
    // still readable, and de-duping heuristically would risk hiding a
    // real signal.
    const relevantEvents: DnsTimelineEvent[] = [];
    for (const e of events || []) {
      const obj = e.involvedObject;
      if (!obj) continue;
      const matchesDnsPolicy =
        obj.kind === 'DNSPolicy' &&
        obj.name === dnsPolicy?.metadata?.name &&
        obj.namespace === dnsPolicy?.metadata?.namespace;
      const matchesGateway =
        obj.kind === 'Gateway' &&
        obj.name === gatewayName &&
        obj.namespace === gatewayNs;
      const matchesRoute =
        obj.kind === 'HTTPRoute' &&
        obj.name === httpRoute?.metadata?.name &&
        obj.namespace === httpRoute?.metadata?.namespace;
      if (!matchesDnsPolicy && !matchesGateway && !matchesRoute) continue;
      const when = e.lastTimestamp || e.eventTime || e.metadata?.creationTimestamp;
      if (!when) continue;
      relevantEvents.push({
        when,
        title: `${obj.kind} ${e.reason || ''}`.trim(),
        detail: e.message,
        status: e.type === 'Warning' ? 'warning' : 'healthy',
      });
    }

    // Fallback: derive rows from status.conditions[].lastTransitionTime.
    // Reads the *terminal* condition (Accepted / Enforced / Programmed
    // / ResolvedRefs) — the transitions the operator actually needs to
    // see. False conditions get a 'failing' dot; True conditions get
    // 'healthy'. Missing lastTransitionTime rows are skipped.
    const pushCondition = (
      objectKind: string,
      objectName: string | undefined,
      conds: Array<{ type?: string; status?: string; reason?: string; message?: string; lastTransitionTime?: string }> | undefined,
      condType: string,
    ) => {
      if (!objectName || !conds) return;
      const c = conds.find((x) => x.type === condType);
      if (!c?.lastTransitionTime) return;
      const ok = c.status === 'True';
      relevantEvents.push({
        when: c.lastTransitionTime,
        title: `${objectKind} ${objectName} ${condType} → ${c.status}`,
        detail: c.message || c.reason,
        status: ok ? 'healthy' : 'failing',
      });
    };
    pushCondition('DNSPolicy', dnsPolicy?.metadata?.name, dnsPolicy?.status?.conditions, 'Accepted');
    pushCondition('DNSPolicy', dnsPolicy?.metadata?.name, dnsPolicy?.status?.conditions, 'Enforced');
    pushCondition('Gateway', gatewayName, gateway?.status?.conditions, 'Accepted');
    pushCondition('Gateway', gatewayName, gateway?.status?.conditions, 'Programmed');
    pushCondition(
      'HTTPRoute',
      httpRoute?.metadata?.name,
      httpRoute?.status?.parents?.[0]?.conditions,
      'Accepted',
    );
    pushCondition(
      'HTTPRoute',
      httpRoute?.metadata?.name,
      httpRoute?.status?.parents?.[0]?.conditions,
      'ResolvedRefs',
    );

    relevantEvents.sort((a, b) => a.when.localeCompare(b.when));

    // ------- Checks table -------
    const checks = [
      { id: 'dnspolicy-valid', label: 'DNSPolicy is valid', status: dnsPolicy ? (dnsPolicyAccepted?.ok ? 'healthy' : 'failing') : 'not-configured' },
      { id: 'gateway-exists', label: 'Gateway exists and is ready', status: gateway ? (gwProgrammed?.ok ? 'healthy' : 'pending') : 'not-configured' },
      { id: 'hostname-configured', label: 'Hostname is configured', status: hostname ? 'healthy' : 'not-configured' },
      { id: 'dns-record-created', label: 'DNS record created', status: providerStep.status },
      { id: 'zone-match', label: 'Hosted zone matches hostname suffix', status: dnsPolicy ? 'healthy' : 'skipped' },
      { id: 'dns-propagation', label: 'DNS propagation', status: publicDnsStep.status },
      { id: 'public-dns-resolution', label: 'Public DNS resolution', status: publicDnsStep.status === 'healthy' ? 'healthy' : publicDnsStep.status === 'pending' ? 'pending' : 'failing' },
      { id: 'httproute-attached', label: 'HTTPRoute attached', status: httpRoute ? (routeAccepted?.ok ? 'healthy' : 'failing') : 'not-configured' },
      { id: 'backend-reachable', label: 'Backend Services resolve', status: backendStep.status },
      { id: 'tls-certificate', label: 'TLS certificate', status: (publicDnsStep.status === 'healthy' ? 'healthy' : 'skipped') as StepStatus, details: publicDnsStep.status === 'healthy' ? 'issued' : 'waiting for DNS resolution' },
    ].map((c) => ({ ...c, status: c.status as StepStatus }));

    const needsDnsPolicy =
      hostnameOptions.length > 0 && gateway !== null && dnsPolicy === null;

    const rawObjects: DnsFlow['rawObjects'] = [
      {
        kind: 'DNSPolicy',
        group: 'kuadrant.io',
        version: 'v1',
        name: dnsPolicy?.metadata?.name,
        namespace: dnsPolicy?.metadata?.namespace,
        conditions: dnsPolicy?.status?.conditions,
      },
      {
        kind: 'Gateway',
        group: 'gateway.networking.k8s.io',
        version: 'v1',
        name: gateway?.metadata?.name,
        namespace: gateway?.metadata?.namespace,
        conditions: gateway?.status?.conditions,
      },
      {
        kind: 'HTTPRoute',
        group: 'gateway.networking.k8s.io',
        version: 'v1',
        name: httpRoute?.metadata?.name,
        namespace: httpRoute?.metadata?.namespace,
        // Flatten status.parents[*].conditions since Advanced doesn't
        // need to know about the parent nesting — the first parent's
        // conditions are what the flow cards used.
        conditions: httpRoute?.status?.parents?.[0]?.conditions,
      },
      {
        kind: 'DNSRecord',
        group: 'kuadrant.io',
        version: 'v1alpha1',
        name: matchingRecord?.metadata?.name,
        namespace: matchingRecord?.metadata?.namespace,
        conditions: matchingRecord?.status?.conditions,
      },
    ];

    return {
      hostname,
      hostnameOptions,
      overallStatus: overall,
      steps,
      events: relevantEvents.slice(-12), // trim to the most recent 12 so the timeline stays scannable
      checks,
      loading,
      primaryFailure,
      needsDnsPolicy,
      targetGateway: gateway ? { name: gatewayName, namespace: gatewayNs } : null,
      rawObjects,
    };
  }, [
    dnsPolicies,
    dnsPoliciesLoaded,
    gateways,
    gatewaysLoaded,
    routes,
    routesLoaded,
    events,
    eventsLoaded,
    dnsRecords,
    dnsRecordsLoaded,
    selectedHostname,
  ]);
}
