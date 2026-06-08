import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import {
  requestRateQuery,
  statusCodeRateQuery,
  latencyPercentileQuery,
  successRateQuery,
} from '../utils/prometheusQueries';
import { usePollingEffect } from './usePollingEffect';

export interface TrafficData {
  requestRate1m: number | null;
  requestRate5m: number | null;
  successRate: number | null;
  rate2xx: number | null;
  rate4xx: number | null;
  rate5xx: number | null;
  latencyP50: number | null;
  latencyP95: number | null;
  latencyP99: number | null;
}

interface UsePrometheusTrafficResult {
  data: TrafficData;
  loaded: boolean;
  error: Error | null;
  metricsAvailable: boolean;
}

const EMPTY_TRAFFIC: TrafficData = {
  requestRate1m: null, requestRate5m: null, successRate: null,
  rate2xx: null, rate4xx: null, rate5xx: null,
  latencyP50: null, latencyP95: null, latencyP99: null,
};

/**
 * 9 Prometheus queries (request rates, status code rates, latency percentiles)
 * per poll. Heaviest of the polling hooks — used by TrafficPanel on the
 * Gateway/HTTPRoute Metrics tab.
 *
 * Polling delegated to usePollingEffect:
 *   - pauses when the browser tab is hidden,
 *   - stops entirely on metricsAvailable=false (next input change reactivates),
 *   - cancels in-flight requests when the poll re-arms or component unmounts.
 *
 * Default pollInterval bumped to 60s from 30s — 9 queries × 30s vs 9 × 60s
 * roughly halves the Prometheus load per visible card. The Console UWM
 * scrape interval is 30s already, so a 60s poll never lags more than one
 * scrape window.
 */
export function usePrometheusTraffic(
  kind: 'Gateway' | 'HTTPRoute',
  name: string,
  namespace: string,
  pollInterval = 60000,
): UsePrometheusTrafficResult {
  const [data, setData] = React.useState<TrafficData>(EMPTY_TRAFFIC);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [metricsAvailable, setMetricsAvailable] = React.useState(true);

  const inputsReady = !!(name && namespace);

  usePollingEffect(
    async (signal) => {
      if (!inputsReady) {
        setData(EMPTY_TRAFFIC);
        setLoaded(true);
        return;
      }

      const queries = {
        requestRate1m: requestRateQuery(namespace, name, kind, '1m'),
        requestRate5m: requestRateQuery(namespace, name, kind, '5m'),
        successRate: successRateQuery(namespace, name, kind),
        rate2xx: statusCodeRateQuery(namespace, name, kind, '2xx'),
        rate4xx: statusCodeRateQuery(namespace, name, kind, '4xx'),
        rate5xx: statusCodeRateQuery(namespace, name, kind, '5xx'),
        latencyP50: latencyPercentileQuery(namespace, name, kind, 0.5),
        latencyP95: latencyPercentileQuery(namespace, name, kind, 0.95),
        latencyP99: latencyPercentileQuery(namespace, name, kind, 0.99),
      };

      try {
        const results = await Promise.all(
          Object.entries(queries).map(async ([key, query]) => {
            try {
              const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
              const response = await consoleFetch(url, { signal }, 10_000);
              const json = await response.json();
              const value = json?.data?.result?.[0]?.value?.[1];
              return [key, value ? parseFloat(value) : null] as const;
            } catch {
              return [key, null] as const;
            }
          }),
        );

        if (signal.aborted) return;
        const newData = { ...EMPTY_TRAFFIC };
        for (const [key, value] of results) {
          (newData as Record<string, number | null>)[key] = value;
        }
        setData(newData);
        setLoaded(true);
        setError(null);
        setMetricsAvailable(true);
      } catch (e) {
        if (signal.aborted) return;
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.message.includes('404') || err.message.includes('503')) {
          setMetricsAvailable(false);
          setLoaded(true);
        } else {
          setError(err);
        }
      }
    },
    [kind, name, namespace, inputsReady],
    { intervalMs: pollInterval, enabled: metricsAvailable },
  );

  return { data, loaded, error, metricsAvailable };
}
