import { useState, useEffect, useCallback, useRef } from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export interface TimeSeries {
  label: string;
  data: { x: Date; y: number }[];
}

interface UsePrometheusRangeResult {
  series: TimeSeries[];
  loaded: boolean;
  metricsAvailable: boolean;
}

interface RangeQuerySpec {
  label: string;
  query: string;
}

export function usePrometheusRange(
  queries: RangeQuerySpec[],
  durationSeconds = 3600,
  stepSeconds = 60,
  pollInterval = 30000,
): UsePrometheusRangeResult {
  const [series, setSeries] = useState<TimeSeries[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [metricsAvailable, setMetricsAvailable] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queriesKey = queries.map((q) => q.query).join('|');

  const fetchRange = useCallback(async () => {
    if (queries.length === 0) return;

    const now = Math.floor(Date.now() / 1000);
    const start = now - durationSeconds;

    try {
      const results = await Promise.all(
        queries.map(async (spec) => {
          try {
            const params = new URLSearchParams({
              query: spec.query,
              start: String(start),
              end: String(now),
              step: String(stepSeconds),
            });
            const url = `/api/prometheus/api/v1/query_range?${params}`;
            const response = await consoleFetch(url);
            const json = await response.json();
            const values: [number, string][] =
              json?.data?.result?.[0]?.values || [];
            return {
              label: spec.label,
              data: values.map(([ts, val]) => ({
                x: new Date(ts * 1000),
                y: parseFloat(val) || 0,
              })),
            } as TimeSeries;
          } catch {
            return { label: spec.label, data: [] } as TimeSeries;
          }
        }),
      );

      setSeries(results);
      setLoaded(true);
      setMetricsAvailable(true);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes('404') || err.message.includes('503')) {
        setMetricsAvailable(false);
      }
      setLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriesKey, durationSeconds, stepSeconds]);

  useEffect(() => {
    fetchRange();
    intervalRef.current = setInterval(fetchRange, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRange, pollInterval]);

  return { series, loaded, metricsAvailable };
}
