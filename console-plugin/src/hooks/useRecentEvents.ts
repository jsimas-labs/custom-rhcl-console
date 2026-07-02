import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  GatewayGVK,
  HTTPRouteGVK,
  APIProductGVK,
  APIKeyGVK,
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
  policyResourceURL,
} from '../models';
import { RecentEvent } from '../components/overview/types';
import { K8sCondition } from '../types';

interface CRDLike extends K8sResourceCommon {
  status?: {
    conditions?: K8sCondition[];
    phase?: string;
  };
}

interface KindedResource {
  kind: string;
  items: CRDLike[];
}

// Conditions whose `status === 'True'` means "everything is fine". A
// transition to True is a success; a transition to False is a warning.
const POSITIVE_CONDITIONS = new Set([
  'Accepted',
  'Programmed',
  'Ready',
  'Enforced',
  'ResolvedRefs',
  'Available',
  'Approved',
]);
// Conditions whose `status === 'True'` means "something is wrong". A
// transition to True is critical; a transition to False is a success.
const NEGATIVE_CONDITIONS = new Set(['Degraded', 'Failed', 'Error', 'Rejected']);

function eventSeverity(c: K8sCondition): RecentEvent['severity'] {
  if (NEGATIVE_CONDITIONS.has(c.type)) {
    if (c.status === 'True') return 'critical';
    if (c.status === 'False') return 'success';
    return 'info';
  }
  if (POSITIVE_CONDITIONS.has(c.type)) {
    if (c.status === 'True') return 'success';
    if (c.status === 'False') return 'warning';
    return 'info';
  }
  return 'info';
}

function relativeAgo(ms: number): string {
  if (!ms) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'just now';
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function hrefFor(kind: string, ns: string, name: string): string {
  switch (kind) {
    case 'Gateway':
      return `/connectivity-link/gateways/${ns}/${name}`;
    case 'HTTPRoute':
      return `/connectivity-link/httproutes/${ns}/${name}`;
    case 'AuthPolicy':
    case 'RateLimitPolicy':
    case 'TokenRateLimitPolicy':
    case 'DNSPolicy':
    case 'TLSPolicy':
      return policyResourceURL(kind, ns, name);
    case 'APIProduct':
      return `/connectivity-link/api-products/${ns}/${name}`;
    case 'APIKey':
      return '/connectivity-link/apikeys';
    default:
      return '/connectivity-link';
  }
}

function transitionVerb(c: K8sCondition): string {
  // Render the transition as a short verb-phrase the way an operator
  // would describe it: "Programmed = True" → "is now programmed",
  // "Accepted = False" → "no longer accepted", etc.
  const isTrue = c.status === 'True';
  if (NEGATIVE_CONDITIONS.has(c.type)) {
    return isTrue ? `is ${c.type.toLowerCase()}` : `recovered from ${c.type.toLowerCase()}`;
  }
  if (POSITIVE_CONDITIONS.has(c.type)) {
    return isTrue ? `is now ${c.type.toLowerCase()}` : `no longer ${c.type.toLowerCase()}`;
  }
  return `${c.type} = ${c.status}`;
}

const MAX_EVENTS = 8;

interface UseRecentEventsResult {
  events: RecentEvent[];
  loaded: boolean;
}

/**
 * Synthesized "what happened lately" feed for the Overview page.
 *
 * The Kuadrant operator and the OpenShift gateway-controller don't emit
 * k8s Events for the kinds the Overview cares about — they write
 * everything into `status.conditions` instead. A naive Events API watch
 * always came back empty and the panel looked broken.
 *
 * Instead we watch the RHCL CRs directly (Gateway, HTTPRoute, 5 policy
 * kinds, APIProduct, APIKey), walk every condition on every resource,
 * and turn each `lastTransitionTime` into a timeline entry. Sorted
 * newest-first, capped at 8 — same shape the RecentEventsPanel already
 * consumes, so the visual contract is preserved.
 */
export function useRecentEvents(): UseRecentEventsResult {
  const [gateways, gwLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });
  const [routes, rtLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });
  const [apiProducts, apLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: APIProductGVK,
    isList: true,
  });
  const [apiKeys, akLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: APIKeyGVK,
    isList: true,
  });
  const [authP, authLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
  });
  const [rlp, rlpLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const [trlp, trlpLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
  });
  const [dnsP, dnsLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [tlsP, tlsLoaded] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
  });

  return React.useMemo<UseRecentEventsResult>(() => {
    const loaded =
      gwLoaded &&
      rtLoaded &&
      apLoaded &&
      akLoaded &&
      authLoaded &&
      rlpLoaded &&
      trlpLoaded &&
      dnsLoaded &&
      tlsLoaded;

    const groups: KindedResource[] = [
      { kind: 'Gateway', items: gateways || [] },
      { kind: 'HTTPRoute', items: routes || [] },
      { kind: 'AuthPolicy', items: authP || [] },
      { kind: 'RateLimitPolicy', items: rlp || [] },
      { kind: 'TokenRateLimitPolicy', items: trlp || [] },
      { kind: 'DNSPolicy', items: dnsP || [] },
      { kind: 'TLSPolicy', items: tlsP || [] },
      { kind: 'APIProduct', items: apiProducts || [] },
      { kind: 'APIKey', items: apiKeys || [] },
    ];

    const out: Array<RecentEvent & { _ts: number }> = [];
    for (const group of groups) {
      for (const r of group.items) {
        const ns = r.metadata?.namespace || '';
        const name = r.metadata?.name || '';
        if (!name) continue;

        let conds: K8sCondition[] = r.status?.conditions || [];

        // HTTPRoute hides its conditions one level deeper, under
        // status.parents[].conditions — flatten them to the same shape
        // the other kinds use.
        if (group.kind === 'HTTPRoute') {
          const parents = (r as unknown as { status?: { parents?: Array<{ conditions?: K8sCondition[] }> } })
            .status?.parents;
          if (parents && parents.length > 0) {
            conds = parents.flatMap((p) => p.conditions || []);
          }
        }

        for (const c of conds) {
          if (!c.lastTransitionTime) continue;
          const ts = new Date(c.lastTransitionTime).getTime();
          if (!Number.isFinite(ts) || ts === 0) continue;
          out.push({
            _ts: ts,
            id: `${group.kind}-${ns}-${name}-${c.type}-${c.lastTransitionTime}`,
            occurredAt: relativeAgo(ts),
            title: `${group.kind} ${name} ${transitionVerb(c)}`,
            detail: c.message || c.reason || '',
            severity: eventSeverity(c),
            href: hrefFor(group.kind, ns, name),
          });
        }
      }
    }

    out.sort((a, b) => b._ts - a._ts);
    const events: RecentEvent[] = out.slice(0, MAX_EVENTS).map(({ _ts, ...e }) => {
      void _ts;
      return e;
    });
    return { events, loaded };
  }, [
    gateways,
    routes,
    apiProducts,
    apiKeys,
    authP,
    rlp,
    trlp,
    dnsP,
    tlsP,
    gwLoaded,
    rtLoaded,
    apLoaded,
    akLoaded,
    authLoaded,
    rlpLoaded,
    trlpLoaded,
    dnsLoaded,
    tlsLoaded,
  ]);
}
