import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import {
  routeBackendRequestRateQuery,
  routeBackendSuccessRateQuery,
  routeBackendErrorRateQuery,
} from '../utils/prometheusQueries';

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
 * any single query degrades gracefully to `null` for that metric without
 * blanking the others (e.g. success% naturally returns NaN when reqRate=0,
 * but reqRate=0 itself is still useful information).
 *
 * Poll interval is intentionally on the longer side (30s) since the card
 * shows a steady-state snapshot, not a live trend — and the same Prometheus
 * is being queried by other panels on the page; we don't want to be the one
 * starving it.
 *
 * Surfaces `metricsAvailable=false` when the Console's Prometheus proxy
 * returns 404 or 503, so the UI can switch to a "Metrics unavailable on this
 * cluster" hint instead of a misleading dash.
 */
export function useBackendTraffic(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
  pollInterval = 30000,
): UseBackendTrafficResult {
  const [data, setData] = React.useState<BackendTrafficData>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);
  const [metricsAvailable, setMetricsAvailable] = React.useState(true);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = React.useCallback(async () => {
    // Empty inputs short-circuit. Mark loaded so the UI renders "—" rather
    // than spinning forever on a route whose parent didn't load yet.
    if (!routeName || !routeNamespace || !backendName || !backendNamespace) {
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
            const response = await consoleFetch(url);
            const json = await response.json();
            const value = json?.data?.result?.[0]?.value?.[1];
            const parsed = value != null ? parseFloat(value) : NaN;
            return [key, Number.isFinite(parsed) ? parsed : null] as const;
          } catch {
            return [key, null] as const;
          }
        }),
      );

      const next: BackendTrafficData = { ...EMPTY };
      for (const [key, value] of results) {
        next[key] = value;
      }
      setData(next);
      setMetricsAvailable(true);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes('404') || err.message.includes('503')) {
        setMetricsAvailable(false);
      }
    } finally {
      setLoaded(true);
    }
  }, [routeNamespace, routeName, backendNamespace, backendName]);

  React.useEffect(() => {
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMetrics, pollInterval]);

  return { data, loaded, metricsAvailable };
}
