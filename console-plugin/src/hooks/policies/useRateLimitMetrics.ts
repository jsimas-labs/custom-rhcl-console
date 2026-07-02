import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { usePollingEffect } from '../usePollingEffect';
import { PolicyResource } from '../../components/policies/shared/types';
import { primaryTargetRef } from '../../utils/policyTargets';

export interface RateLimitMetrics {
  totalPerMin: number;
  allowedPerMin: number;
  rejectedPerMin: number;
  rejectionPct: number;
  // Per-consumer top-N (by req/min, last 5 min).
  topConsumers: { consumerId: string; perMin: number }[];
  sparkline: { t: number; v: number }[];
}

interface Result {
  metrics: RateLimitMetrics;
  loaded: boolean;
  metricsAvailable: boolean;
}

const EMPTY: RateLimitMetrics = {
  totalPerMin: 0,
  allowedPerMin: 0,
  rejectedPerMin: 0,
  rejectionPct: 0,
  topConsumers: [],
  sparkline: [],
};

function selectorFor(policy: PolicyResource): string | null {
  const ref = primaryTargetRef(policy);
  if (!ref?.name) return null;
  const ns = ref.namespace || policy.metadata?.namespace;
  if (ref.kind === 'Gateway') {
    return `reporter="source",source_workload=~"${ref.name}(-.*)?",source_workload_namespace="${ns}"`;
  }
  if (ref.kind === 'HTTPRoute') {
    return `reporter="source",route_name=~"${ns}\\\\.${ref.name}\\\\..+"`;
  }
  return null;
}

/**
 * RateLimitPolicy runtime metrics — counts 429 ("rate-limited") versus
 * the rest, and aggregates by `request_headers_x_consumer_id` for the
 * Top Consumers panel. The consumer label is only present on traffic
 * that flowed through the api-key/authn step; anonymous requests show
 * up as `<nil>` and are filtered out of the ranking.
 */
export function useRateLimitMetrics(policy: PolicyResource | undefined): Result {
  const [metrics, setMetrics] = React.useState<RateLimitMetrics>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);
  const [metricsAvailable, setMetricsAvailable] = React.useState(true);
  const sel = policy ? selectorFor(policy) : null;

  usePollingEffect(
    async (signal) => {
      if (!sel) {
        setLoaded(true);
        return;
      }
      const Q_TOTAL = `sum(rate(istio_requests_total{${sel}}[5m]))`;
      const Q_REJECTED = `sum(rate(istio_requests_total{${sel},response_code="429"}[5m]))`;
      const Q_TOP = `topk(5, sum by(request_headers_x_consumer_id)(rate(istio_requests_total{${sel},request_headers_x_consumer_id!="",request_headers_x_consumer_id!="<nil>"}[5m])))`;
      const Q_SPARK = `sum(rate(istio_requests_total{${sel}}[2m]))`;

      const fetchInst = async (q: string): Promise<number> => {
        try {
          const r = await consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(q)}`,
            { signal },
            10_000,
          );
          const j = await r.json();
          const v = j?.data?.result?.[0]?.value?.[1];
          return v ? parseFloat(v) : 0;
        } catch {
          return 0;
        }
      };
      const fetchSeries = async (q: string): Promise<{ consumerId: string; perMin: number }[]> => {
        try {
          const r = await consoleFetch(
            `/api/prometheus/api/v1/query?query=${encodeURIComponent(q)}`,
            { signal },
            10_000,
          );
          const j = await r.json();
          const rows = j?.data?.result || [];
          return rows.map((row: { metric: Record<string, string>; value: [number, string] }) => ({
            consumerId: row.metric?.request_headers_x_consumer_id || '—',
            perMin: Math.round((parseFloat(row.value?.[1]) || 0) * 60),
          }));
        } catch {
          return [];
        }
      };

      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 1800;
        const step = 150;
        const [total, rejected, top, sparkJson] = await Promise.all([
          fetchInst(Q_TOTAL),
          fetchInst(Q_REJECTED),
          fetchSeries(Q_TOP),
          consoleFetch(
            `/api/prometheus/api/v1/query_range?` +
              new URLSearchParams({
                query: Q_SPARK,
                start: String(start),
                end: String(now),
                step: String(step),
              }).toString(),
            { signal },
            15_000,
          ).then((r) => r.json()),
        ]);
        if (signal.aborted) return;
        const values: [number, string][] = sparkJson?.data?.result?.[0]?.values || [];
        const sparkline = values.map(([, v], i) => ({ t: i, v: parseFloat(v) || 0 }));
        const totalPerMin = Math.round(total * 60);
        const rejectedPerMin = Math.round(rejected * 60);
        const allowedPerMin = Math.max(0, totalPerMin - rejectedPerMin);
        setMetrics({
          totalPerMin,
          allowedPerMin,
          rejectedPerMin,
          rejectionPct: total > 0 ? Math.round((rejected / total) * 1000) / 10 : 0,
          topConsumers: top.sort((a, b) => b.perMin - a.perMin),
          sparkline,
        });
        setLoaded(true);
        setMetricsAvailable(true);
      } catch (e) {
        if (signal.aborted) return;
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.message.includes('404') || err.message.includes('503')) {
          setMetricsAvailable(false);
        }
        setLoaded(true);
      }
    },
    [sel],
    { intervalMs: 60_000, enabled: !!sel },
  );

  return { metrics, loaded, metricsAvailable };
}
