import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import {
  routeBackendRequestRateQuery,
  routeBackendSuccessRateQuery,
  routeBackendErrorRateQuery,
} from '../utils/prometheusQueries';
import { usePollingEffect } from './usePollingEffect';

export interface BackendTrafficData {
  reqRate: number | null;        // req/s, sum across all rules of the route → this backend
  successRate: number | null;    // % 2xx+3xx of total, 0–100
  errorRate: number | null;      // req/s of 5xx only
}

interface UseBackendTrafficResult {
  data: BackendTrafficData;
  loaded: boolean;
  metricsAvailable: boolean;     // false when Prometheus returns 404/503 — cluster has no UWM
}

const EMPTY: BackendTrafficData = { reqRate: null, successRate: null, errorRate: null };

/**
 * Polls cluster Prometheus for traffic this HTTPRoute sends to a *specific*
 * backend Service. One row of metrics per BackendStatusCard.
 *
 * Three queries fire in parallel — request rate, success%, error rate —
 * because the BackendStatusCard renders all three side by side. A failure on
 * any single query degrades gracefully to `null` for that metric.
 *
 * Cost model:
 *   - Polling driven by `usePollingEffect`: pauses when the browser tab is
 *     hidden, and STOPS entirely once `metricsAvailable` flips to false
 *     (Prometheus is unreachable — no point hammering it). Resumes on the
 *     next input change.
 *   - Default `pollInterval` is 60s. The card already uses the most recent
 *     synthetic probe for "is it alive right now?"; the Prometheus number
 *     is a steady-state read where 1-minute lag is fine. Going to 60s
 *     halves the load vs the previous 30s default — meaningful when a
 *     route has N cards each polling.
 *   - In-flight requests are aborted on poll-tick / unmount / tab hide via
 *     the AbortSignal threaded through consoleFetch, so a slow Prometheus
 *     never lets queries queue up.
 */
export function useBackendTraffic(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
  pollInterval = 60000,
): UseBackendTrafficResult {
  const [data, setData] = React.useState<BackendTrafficData>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);
  const [metricsAvailable, setMetricsAvailable] = React.useState(true);

  const inputsReady = !!(routeName && routeNamespace && backendName && backendNamespace);

  usePollingEffect(
    async (signal) => {
      if (!inputsReady) {
        setData(EMPTY);
        setLoaded(true);
        return;
      }

      const queries: Record<keyof BackendTrafficData, string> = {
        reqRate: routeBackendRequestRateQuery(routeNamespace, routeName, backendNamespace, backendName),
        successRate: routeBackendSuccessRateQuery(routeNamespace, routeName, backendNamespace, backendName),
        errorRate: routeBackendErrorRateQuery(routeNamespace, routeName, backendNamespace, backendName),
      };

      try {
        const results = await Promise.all(
          (Object.entries(queries) as [keyof BackendTrafficData, string][]).map(async ([key, query]) => {
            try {
              const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
              // 10s timeout via the SDK's consoleFetch signature; the AbortSignal
              // covers cancellation on unmount / next poll / tab hide.
              const response = await consoleFetch(url, { signal }, 10_000);
              const json = await response.json();
              const value = json?.data?.result?.[0]?.value?.[1];
              const parsed = value != null ? parseFloat(value) : NaN;
              return [key, Number.isFinite(parsed) ? parsed : null] as const;
            } catch {
              return [key, null] as const;
            }
          }),
        );

        if (signal.aborted) return;
        const next: BackendTrafficData = { ...EMPTY };
        for (const [key, value] of results) next[key] = value;
        setData(next);
        setMetricsAvailable(true);
      } catch (e) {
        if (signal.aborted) return;
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.message.includes('404') || err.message.includes('503')) {
          setMetricsAvailable(false);
        }
      } finally {
        if (!signal.aborted) setLoaded(true);
      }
    },
    [routeNamespace, routeName, backendNamespace, backendName, inputsReady],
    {
      intervalMs: pollInterval,
      // Stop polling once Prometheus is known-unavailable. The next time
      // inputs change (operator navigates / picks a different backend) we
      // try again — but we don't keep dialing a busy signal.
      enabled: metricsAvailable,
    },
  );

  return { data, loaded, metricsAvailable };
}
