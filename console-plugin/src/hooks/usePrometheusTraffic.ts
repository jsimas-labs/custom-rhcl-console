import { useState, useEffect, useCallback, useRef } from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import {
  requestRateQuery,
  statusCodeRateQuery,
  latencyPercentileQuery,
  successRateQuery,
} from '../utils/prometheusQueries';

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
  requestRate1m: null,
  requestRate5m: null,
  successRate: null,
  rate2xx: null,
  rate4xx: null,
  rate5xx: null,
  latencyP50: null,
  latencyP95: null,
  latencyP99: null,
};

export function usePrometheusTraffic(
  kind: 'Gateway' | 'HTTPRoute',
  name: string,
  namespace: string,
  pollInterval = 30000,
  // Aggregation window for the rate/success/status queries. Default 5m
  // matches the Metrics tab's "current load" view; the API Product
  // "Traffic (last hour)" card passes '1h' so the displayed numbers
  // actually correspond to its title (previously it claimed last hour
  // but used a 5-minute rate window — visible mismatch).
  window: '1m' | '5m' | '15m' | '1h' = '5m',
): UsePrometheusTrafficResult {
  const [data, setData] = useState<TrafficData>(EMPTY_TRAFFIC);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [metricsAvailable, setMetricsAvailable] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = useCallback(async () => {
    // Empty name/namespace: nothing to query, but we still need to mark
    // loaded so the consumer renders a "-" instead of spinning forever.
    // The original code returned early without touching state — that's
    // what kept the Traffic card stuck on a spinner on API Product detail
    // when the product loaded before the route name was resolved (and
    // anywhere else this hook is called with a not-yet-ready name).
    if (!name || !namespace) {
      setData(EMPTY_TRAFFIC);
      setLoaded(true);
      return;
    }

    // requestRate1m is always 1 minute (used as the "current instant"
    // signal). Everything else uses the consumer-supplied `window` —
    // that's what makes "Traffic (last hour)" actually compute over 1h.
    const queries = {
      requestRate1m: requestRateQuery(namespace, name, kind, '1m'),
      requestRate5m: requestRateQuery(namespace, name, kind, window as '1m' | '5m'),
      successRate: successRateQuery(namespace, name, kind, window),
      rate2xx: statusCodeRateQuery(namespace, name, kind, '2xx', window),
      rate4xx: statusCodeRateQuery(namespace, name, kind, '4xx', window),
      rate5xx: statusCodeRateQuery(namespace, name, kind, '5xx', window),
      latencyP50: latencyPercentileQuery(namespace, name, kind, 0.5, window),
      latencyP95: latencyPercentileQuery(namespace, name, kind, 0.95, window),
      latencyP99: latencyPercentileQuery(namespace, name, kind, 0.99, window),
    };

    try {
      const results = await Promise.all(
        Object.entries(queries).map(async ([key, query]) => {
          try {
            const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
            const response = await consoleFetch(url);
            const json = await response.json();
            const value = json?.data?.result?.[0]?.value?.[1];
            return [key, value ? parseFloat(value) : null] as const;
          } catch {
            return [key, null] as const;
          }
        }),
      );

      const newData = { ...EMPTY_TRAFFIC };
      for (const [key, value] of results) {
        (newData as Record<string, number | null>)[key] = value;
      }
      setData(newData);
      setError(null);
      setMetricsAvailable(true);
    } catch (e) {
      // Previously this branch only flipped `loaded` when the error
      // message included "404"/"503"; anything else (auth, timeout, CORS,
      // network) set error but left loaded=false, so the Spinner ran
      // forever. Always mark loaded — we either have data or we have a
      // surfaced state (error/unavailable), but never "still loading".
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes('404') || err.message.includes('503')) {
        setMetricsAvailable(false);
      } else {
        setError(err);
      }
    } finally {
      setLoaded(true);
    }
    // `window` is included so a consumer that switches windows triggers
    // a refetch with the new aggregation instead of silently keeping
    // the previous numbers.
  }, [kind, name, namespace, window]);

  useEffect(() => {
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMetrics, pollInterval]);

  return { data, loaded, error, metricsAvailable };
}
