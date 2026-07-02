import * as React from 'react';
import {
  K8sResourceCommon,
  consoleFetch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  GatewayGVK,
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
  GatewayOpData,
  HealthSeverity,
} from '../components/overview/types';
import { usePollingEffect } from './usePollingEffect';

interface StatusCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
}
interface GatewayResource extends K8sResourceCommon {
  spec?: { gatewayClassName?: string };
  status?: { conditions?: StatusCondition[] };
}

// The OpenShift Gateway API controller names its generated Deployment
// (and therefore the `source_workload` Istio reports in metrics) as
// `<gateway-name>-<gatewayClassName>`. Plain `<gateway-name>` doesn't
// match anything in Prometheus — every per-gateway PromQL row would
// score zero. The bare-name fallback covers gateways managed by other
// controllers that don't apply the suffix.
function expectedWorkloadName(gw: GatewayResource): string {
  const name = gw.metadata?.name || '';
  const cls = gw.spec?.gatewayClassName;
  return cls ? `${name}-${cls}` : name;
}

const RPM_QUERY =
  'sum by (source_workload, source_workload_namespace) ' +
  '(rate(istio_requests_total{reporter="source"}[5m])) * 60';
const SUCCESS_QUERY =
  '100 * sum by (source_workload, source_workload_namespace) ' +
  '(rate(istio_requests_total{reporter="source",response_code=~"2..|3.."}[5m])) ' +
  '/ sum by (source_workload, source_workload_namespace) ' +
  '(rate(istio_requests_total{reporter="source"}[5m]))';
const ERROR_QUERY =
  '100 * sum by (source_workload, source_workload_namespace) ' +
  '(rate(istio_requests_total{reporter="source",response_code=~"5.."}[5m])) ' +
  '/ sum by (source_workload, source_workload_namespace) ' +
  '(rate(istio_requests_total{reporter="source"}[5m]))';

interface PerGatewayStat {
  rpm: number;
  successPct: number;
  errorPct: number;
}

function gatewayKey(ns: string, name: string): string {
  return `${ns}/${name}`;
}

// HTTPRoute can attach to a Gateway via parentRefs[].name (optional
// namespace falling back to the HTTPRoute's own namespace, per the
// Gateway API spec). Skip parents with kind != Gateway.
function httpRouteTargetsGateway(
  route: HTTPRoute,
  gwNamespace: string,
  gwName: string,
): boolean {
  const refs = route.spec?.parentRefs || [];
  for (const ref of refs) {
    if (ref.kind && ref.kind !== 'Gateway') continue;
    const ns = ref.namespace || route.metadata?.namespace;
    if (ns === gwNamespace && ref.name === gwName) return true;
  }
  return false;
}

function gatewayHealth(
  resource: GatewayResource,
  errorPct: number,
): HealthSeverity {
  const conds = resource.status?.conditions || [];
  const accepted = conds.find((c) => c.type === 'Accepted');
  const programmed = conds.find((c) => c.type === 'Programmed');
  if (!accepted || accepted.status !== 'True') return 'critical';
  if (!programmed || programmed.status !== 'True') return 'critical';
  if (errorPct >= 5) return 'warning';
  return 'healthy';
}

interface UseGatewayOperationalDataResult {
  gateways: GatewayOpData[];
  loaded: boolean;
}

/**
 * Per-gateway operational summary for the Overview "Gateways" section.
 *
 * Combines:
 *   - Gateway CRs (status.conditions for health)
 *   - HTTPRoutes (parentRefs → count routes attached to each gateway)
 *   - 5 policy kinds (primaryTargetRef → count policies targeting each gateway)
 *   - Prometheus: 3 aggregated PromQL queries (rpm, success%, error%) keyed
 *     by source_workload + namespace, joined back to the watched gateways.
 *
 * Returns one `GatewayOpData` per Gateway. Health derives from Accepted /
 * Programmed conditions plus the 5% error threshold (matches the rule used
 * by NeedsAttentionPanel).
 */
export function useGatewayOperationalData(): UseGatewayOperationalDataResult {
  const [gateways, gwLoaded] = useK8sWatchResource<GatewayResource[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });
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

  const [stats, setStats] = React.useState<Record<string, PerGatewayStat>>({});
  const [statsLoaded, setStatsLoaded] = React.useState(false);

  usePollingEffect(
    async (signal) => {
      try {
        const queries: [keyof PerGatewayStat, string][] = [
          ['rpm', RPM_QUERY],
          ['successPct', SUCCESS_QUERY],
          ['errorPct', ERROR_QUERY],
        ];
        const results = await Promise.all(
          queries.map(async ([metric, q]) => {
            try {
              const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(q)}`;
              const r = await consoleFetch(url, { signal }, 10_000);
              const json = await r.json();
              return { metric, rows: json?.data?.result || [] };
            } catch {
              return { metric, rows: [] };
            }
          }),
        );
        if (signal.aborted) return;
        const next: Record<string, PerGatewayStat> = {};
        for (const { metric, rows } of results) {
          for (const row of rows) {
            const ns = row?.metric?.source_workload_namespace;
            const name = row?.metric?.source_workload;
            const v = row?.value?.[1];
            if (!ns || !name) continue;
            const k = gatewayKey(ns, name);
            const prev: PerGatewayStat = next[k] || { rpm: 0, successPct: 0, errorPct: 0 };
            const parsed = v ? parseFloat(v) : 0;
            next[k] = { ...prev, [metric]: Number.isFinite(parsed) ? parsed : 0 };
          }
        }
        setStats(next);
        setStatsLoaded(true);
      } catch {
        if (signal.aborted) return;
        setStatsLoaded(true);
      }
    },
    [],
    { intervalMs: 60_000, enabled: true },
  );

  return React.useMemo<UseGatewayOperationalDataResult>(() => {
    const loaded =
      gwLoaded &&
      rtLoaded &&
      authLoaded &&
      rlpLoaded &&
      trlpLoaded &&
      dnsLoaded &&
      tlsLoaded &&
      statsLoaded;

    const allPolicies = [
      ...(authP || []),
      ...(rlp || []),
      ...(trlp || []),
      ...(dnsP || []),
      ...(tlsP || []),
    ];

    const rows: GatewayOpData[] = (gateways || []).map((gw) => {
      const ns = gw.metadata?.namespace || '';
      const name = gw.metadata?.name || '';
      const workloadName = expectedWorkloadName(gw);
      // Try the controller-suffixed name first, fall back to the plain
      // gateway name for gateways managed outside the openshift gateway
      // controller (where source_workload == gateway name directly).
      const s =
        stats[gatewayKey(ns, workloadName)] ||
        stats[gatewayKey(ns, name)] ||
        { rpm: 0, successPct: 0, errorPct: 0 };
      const routesCount = (routes || []).filter((r) =>
        httpRouteTargetsGateway(r, ns, name),
      ).length;
      const policiesCount = allPolicies.filter((p) => {
        const ref = primaryTargetRef(p);
        if (!ref) return false;
        if (ref.kind !== 'Gateway') return false;
        const refNs = ref.namespace || p.metadata?.namespace;
        return refNs === ns && ref.name === name;
      }).length;

      return {
        id: `gw-${ns}-${name}`,
        name,
        namespace: ns,
        health: gatewayHealth(gw, s.errorPct),
        requestsPerMin: Math.round(s.rpm),
        successRatePct: Math.round(s.successPct * 10) / 10,
        errorRatePct: Math.round(s.errorPct * 10) / 10,
        routesCount,
        policiesCount,
        href: `/k8s/ns/${ns}/gateway.networking.k8s.io~v1~Gateway/${name}`,
      };
    });

    rows.sort((a, b) => b.requestsPerMin - a.requestsPerMin);

    return { gateways: rows, loaded };
  }, [
    gateways,
    routes,
    authP,
    rlp,
    trlp,
    dnsP,
    tlsP,
    stats,
    gwLoaded,
    rtLoaded,
    authLoaded,
    rlpLoaded,
    trlpLoaded,
    dnsLoaded,
    tlsLoaded,
    statsLoaded,
  ]);
}
