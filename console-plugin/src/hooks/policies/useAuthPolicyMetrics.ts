import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { usePollingEffect } from '../usePollingEffect';
import { PolicyResource } from '../../components/policies/shared/types';
import { primaryTargetRef } from '../../utils/policyTargets';

export interface AuthPolicyMetrics {
  /** Total requests over the last 5 min. */
  total: number;
  /** Requests that returned 2xx/3xx (authenticated and allowed). */
  authenticated: number;
  /** 401 — credentials missing/invalid. */
  unauthorized: number;
  /** 403 — request denied by an AuthPolicy rule. */
  forbidden: number;
  /** Authenticated as a percentage of total. 0 when total === 0. */
  successRatePct: number;
  /** Sparkline series (12 points / 30 min): one point per bucket, total req/s. */
  sparkline: { t: number; v: number }[];
}

interface Result {
  metrics: AuthPolicyMetrics;
  loaded: boolean;
  metricsAvailable: boolean;
}

const EMPTY: AuthPolicyMetrics = {
  total: 0,
  authenticated: 0,
  unauthorized: 0,
  forbidden: 0,
  successRatePct: 0,
  sparkline: [],
};

/**
 * Build the PromQL selector that matches series produced by the target
 * the policy attaches to. Gateway targets fan out to every route under
 * that gateway via `source_workload`; HTTPRoute targets pin to that
 * single route via `route_name=~"<ns>\.<name>\..+"` (the Istio
 * tagOverride suffixes the rule index, so we anchor on the route part).
 */
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
 * Per-AuthPolicy authentication metrics. PromQL aggregates filtered to
 * the policy's target, broken down by response_code to derive the
 * authenticated/unauthorized/forbidden split that an operator looking
 * at an AuthPolicy actually cares about. The sparkline is total req/s
 * over the last 30 min so the operator sees that the policy is in fact
 * receiving traffic — empty sparkline + Enforced=True usually means the
 * target itself is idle, not that the policy is broken.
 */
export function useAuthPolicyMetrics(policy: PolicyResource | undefined): Result {
  const [metrics, setMetrics] = React.useState<AuthPolicyMetrics>(EMPTY);
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
      const Q_2XX = `sum(rate(istio_requests_total{${sel},response_code=~"2..|3.."}[5m]))`;
      const Q_401 = `sum(rate(istio_requests_total{${sel},response_code="401"}[5m]))`;
      const Q_403 = `sum(rate(istio_requests_total{${sel},response_code="403"}[5m]))`;
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

      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 1800;
        const step = 150;
        const [total, authed, u401, u403, sparkJson] = await Promise.all([
          fetchInst(Q_TOTAL),
          fetchInst(Q_2XX),
          fetchInst(Q_401),
          fetchInst(Q_403),
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
        const t = total * 60; // convert per-second average → per-min counter for the cards
        setMetrics({
          total: Math.round(t),
          authenticated: Math.round(authed * 60),
          unauthorized: Math.round(u401 * 60),
          forbidden: Math.round(u403 * 60),
          successRatePct: total > 0 ? Math.round((authed / total) * 1000) / 10 : 0,
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
