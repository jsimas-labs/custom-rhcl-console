import * as React from 'react';
import {
  consoleFetch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { HTTPRouteGVK } from '../models';
import { HTTPRoute } from '../types/httproute';
import {
  BackendRow,
  HealthSeverity,
  SparklinePoint,
} from '../components/overview/types';
import { usePollingEffect } from './usePollingEffect';

const RPM_BY_BACKEND =
  'sum by (destination_service_namespace, destination_service_name) ' +
  '(rate(istio_requests_total{reporter="source", destination_service_name!=""}[5m])) * 60';
const ERROR_PCT_BY_BACKEND =
  '100 * sum by (destination_service_namespace, destination_service_name) ' +
  '(rate(istio_requests_total{reporter="source", response_code=~"5..", destination_service_name!=""}[5m])) ' +
  '/ sum by (destination_service_namespace, destination_service_name) ' +
  '(rate(istio_requests_total{reporter="source", destination_service_name!=""}[5m]))';
const SPARK_BY_BACKEND =
  'sum by (destination_service_namespace, destination_service_name) ' +
  '(rate(istio_requests_total{reporter="source", destination_service_name!=""}[2m]))';

interface PerBackendStats {
  rpm: number;
  errorPct: number;
  sparkline: SparklinePoint[];
}

interface UseBackendHealthResult {
  rows: BackendRow[];
  loaded: boolean;
}

/**
 * Per-backend operational summary for the Overview "Backends" widget.
 *
 * The "set of backends" is derived from every HTTPRoute's
 * `spec.rules[].backendRefs[]` — we don't enumerate Services cluster-wide
 * because the Overview only cares about Services that an RHCL route
 * actually points at. Stats come from 3 PromQL aggregates keyed by
 * `(destination_service_namespace, destination_service_name)`:
 *
 *   - requests/min   (instant)
 *   - error rate %   (instant)
 *   - 12-point sparkline (range, last 30 min, 150s step)
 *
 * Health rule:
 *   - errorPct >= 5%        → critical (data plane is bleeding)
 *   - rpm == 0 && referenced → warning (no traffic — could be a stale ref)
 *   - otherwise              → healthy
 *
 * Deeper service-level checks (Service exists? endpoints ready?) live on
 * the HTTPRoute detail page's Backends tab — too expensive for an
 * Overview that polls every 60s and would have to watch every
 * EndpointSlice cluster-wide.
 */
export function useBackendHealth(): UseBackendHealthResult {
  const [routes, rtLoaded] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });

  const [agg, setAgg] = React.useState<Record<string, PerBackendStats>>({});
  const [aggLoaded, setAggLoaded] = React.useState(false);

  usePollingEffect(
    async (signal) => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 1800;
        const step = 150;

        const [rpmJson, errJson, sparkJson] = await Promise.all([
          consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(RPM_BY_BACKEND)}`,
            { signal },
            10_000,
          ).then((r) => r.json()),
          consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(ERROR_PCT_BY_BACKEND)}`,
            { signal },
            10_000,
          ).then((r) => r.json()),
          consoleFetch(
            `/api/prometheus/api/v1/query_range?` +
              new URLSearchParams({
                query: SPARK_BY_BACKEND,
                start: String(start),
                end: String(now),
                step: String(step),
              }).toString(),
            { signal },
            15_000,
          ).then((r) => r.json()),
        ]);

        if (signal.aborted) return;

        const next: Record<string, PerBackendStats> = {};
        const merge = (key: string, patch: Partial<PerBackendStats>): void => {
          const prev: PerBackendStats = next[key] || { rpm: 0, errorPct: 0, sparkline: [] };
          next[key] = { ...prev, ...patch };
        };

        for (const row of rpmJson?.data?.result || []) {
          const ns = row?.metric?.destination_service_namespace;
          const name = row?.metric?.destination_service_name;
          const v = parseFloat(row?.value?.[1]) || 0;
          if (!ns || !name) continue;
          merge(`${ns}/${name}`, { rpm: v });
        }
        for (const row of errJson?.data?.result || []) {
          const ns = row?.metric?.destination_service_namespace;
          const name = row?.metric?.destination_service_name;
          const v = parseFloat(row?.value?.[1]);
          if (!ns || !name || !Number.isFinite(v)) continue;
          merge(`${ns}/${name}`, { errorPct: v });
        }
        for (const row of sparkJson?.data?.result || []) {
          const ns = row?.metric?.destination_service_namespace;
          const name = row?.metric?.destination_service_name;
          if (!ns || !name) continue;
          const points: SparklinePoint[] = (row?.values || []).map(
            ([, val]: [number, string], i: number) => ({
              t: i,
              v: parseFloat(val) || 0,
            }),
          );
          merge(`${ns}/${name}`, { sparkline: points });
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

  return React.useMemo<UseBackendHealthResult>(() => {
    const loaded = rtLoaded && aggLoaded;

    // Walk every HTTPRoute's backendRefs, dedup by (ns, name). First
    // referencing route wins for the "service" / displayed-name field;
    // refsCount tells us how many routes point at this backend, useful
    // when a backend looks idle but is referenced widely.
    type AccBackend = {
      namespace: string;
      name: string;
      port?: number;
    };
    const seen = new Map<string, AccBackend>();
    for (const r of routes || []) {
      const routeNs = r.metadata?.namespace || '';
      for (const rule of r.spec?.rules || []) {
        for (const ref of rule.backendRefs || []) {
          const ns = ref.namespace || routeNs;
          if (!ns || !ref.name) continue;
          const key = `${ns}/${ref.name}`;
          if (!seen.has(key)) {
            seen.set(key, { namespace: ns, name: ref.name, port: ref.port });
          }
        }
      }
    }

    const healthOf = (rpm: number, errorPct: number): HealthSeverity => {
      if (errorPct >= 5) return 'critical';
      if (rpm === 0) return 'warning';
      return 'healthy';
    };

    const rows: BackendRow[] = [];
    for (const [key, b] of seen.entries()) {
      const stats = agg[key] || { rpm: 0, errorPct: 0, sparkline: [] };
      rows.push({
        id: `be-${key}`,
        name: b.name,
        service: b.name,
        namespace: b.namespace,
        health: healthOf(stats.rpm, stats.errorPct),
        requestsPerMin: Math.round(stats.rpm),
        errorRatePct: Math.round(stats.errorPct * 10) / 10,
        sparkline: stats.sparkline,
        href: `/k8s/ns/${b.namespace}/core~v1~Service/${b.name}`,
      });
    }

    rows.sort((a, b) => b.requestsPerMin - a.requestsPerMin);
    return { rows, loaded };
  }, [routes, agg, rtLoaded, aggLoaded]);
}
