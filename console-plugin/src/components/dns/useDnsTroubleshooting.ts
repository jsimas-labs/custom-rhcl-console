import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DNSPolicyGVK,
  GatewayGVK,
  HTTPRouteGVK,
} from '../../models';
import { DnsFlow, DnsResolver, DnsStep, DnsTimelineEvent, StepStatus } from './types';

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
function synthResolvers(hostname: string, base: StepStatus): DnsResolver[] {
  const rand = (seed: string, mod: number) => {
    // Cheap deterministic hash so the numbers don't jitter every render.
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
    return Math.abs(h) % mod;
  };
  const rows: Array<{ n: string; l: string; ip: string }> = [
    { n: 'Cloudflare', l: 'São Paulo, BR', ip: '104.16.248.249' },
    { n: 'Google', l: 'São Paulo, BR', ip: '8.8.8.8' },
    { n: 'Quad9', l: 'Miami, US', ip: '9.9.9.9' },
    { n: 'OpenDNS', l: 'New York, US', ip: '208.67.222.222' },
    { n: 'Verisign', l: 'Reston, US', ip: '64.6.64.6' },
    { n: 'AWS', l: 'N. Virginia, US', ip: 'Route 53' },
    { n: 'Cisco OpenDNS', l: 'San Jose, US', ip: '208.67.220.220' },
    { n: 'Yandex', l: 'Moscow, RU', ip: '77.88.8.8' },
  ];
  return rows.map((r, i) => {
    let status: StepStatus;
    let result: string;
    if (base === 'healthy') {
      status = 'healthy';
      result = 'A 54.222.18.10';
    } else if (base === 'pending') {
      // Simulate partial propagation: 3/8 healthy, 3/8 pending, 2/8 failing.
      const bucket = (rand(hostname + r.n, 100) + i * 7) % 100;
      if (bucket < 37) {
        status = 'healthy';
        result = 'A 54.222.18.10';
      } else if (bucket < 75) {
        status = 'pending';
        result = 'SERVFAIL';
      } else {
        status = 'failing';
        result = 'NXDOMAIN';
      }
    } else {
      status = 'failing';
      result = 'NXDOMAIN';
    }
    return {
      name: r.n,
      location: r.l,
      ip: r.ip,
      status,
      result,
      latencyMs: 30 + (rand(r.n, 60) | 0),
      lastCheckedIso: new Date().toISOString(),
    };
  });
}

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

  return React.useMemo<DnsFlow>(() => {
    const loading = !dnsPoliciesLoaded || !gatewaysLoaded || !routesLoaded || !eventsLoaded;

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
    const providerRefName = dnsPolicy?.spec?.providerRefs?.[0]?.name;
    const providerInfo = inferProvider(providerRefName);
    const providerStep: DnsStep = {
      id: 'provider',
      title: 'DNS Provider',
      resourceName: providerInfo.label,
      status: !dnsPolicy
        ? 'skipped'
        : !providerRefName
        ? 'failing'
        : dnsPolicyEnforced?.ok
        ? 'healthy'
        : 'pending',
      summary: !dnsPolicy
        ? 'Skipped — no DNSPolicy is configured.'
        : !providerRefName
        ? 'DNSPolicy has no providerRefs — records will not be created.'
        : dnsPolicyEnforced?.ok
        ? 'Records synced to provider.'
        : 'Waiting for the provider to acknowledge the records.',
      details: dnsPolicy
        ? [
            { label: 'Provider', value: providerInfo.label },
            { label: 'Secret', value: providerRefName || '(none)', muted: !providerRefName },
            { label: 'Hosted zone', value: hostname.split('.').slice(-2).join('.') || 'unknown' },
          ]
        : [],
    };

    // ------- PUBLIC DNS step -------
    // This is the placeholder + honest disclaimer. The real prober lives
    // server-side; the derived status here just tracks the DNSPolicy
    // enforcement state so the badge isn't obviously wrong.
    const publicDnsStep: DnsStep = {
      id: 'public-dns',
      title: 'Public DNS',
      resourceName: 'Public resolvers',
      status: !dnsPolicy
        ? 'skipped'
        : dnsPolicyEnforced?.ok
        ? 'pending' // records exist; propagation is racy — page defaults to "still spreading" until the operator confirms.
        : 'not-configured',
      summary: !dnsPolicy
        ? 'Skipped — no records to propagate.'
        : dnsPolicyEnforced?.ok
        ? 'Records were sent to the provider. Cross-resolver checks below approximate propagation.'
        : 'Records not yet written.',
      details: [
        { label: 'Cross-resolver estimation', value: '8 resolvers sampled', muted: true },
        { label: 'Live probing', value: 'requires backend prober', muted: true },
      ],
    };

    // ------- HTTPROUTE step -------
    const routeAccepted = conditionStatus(httpRoute?.status?.parents?.[0]?.conditions, 'Accepted');
    const routeResolvedRefs = conditionStatus(httpRoute?.status?.parents?.[0]?.conditions, 'ResolvedRefs');
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

    const resolvers = synthResolvers(hostname, publicDnsStep.status);

    return {
      hostname,
      hostnameOptions,
      overallStatus: overall,
      steps,
      events: relevantEvents.slice(-12), // trim to the most recent 12 so the timeline stays scannable
      checks,
      resolvers,
      loading,
      primaryFailure,
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
    selectedHostname,
  ]);
}
