import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { usePollingEffect } from './usePollingEffect';

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

/**
 * Range-query variant of usePrometheusTraffic — feeds the line/area charts
 * (TrafficCharts, TrafficSparkline). Heavier per call than the instant
 * queries because each response is `durationSeconds / stepSeconds` data
 * points, but cheaper to render.
 *
 * Polling delegated to usePollingEffect: pauses when the tab is hidden,
 * stops on metricsAvailable=false, cancels in-flight on poll-tick or
 * unmount. Default pollInterval bumped to 60s — same rationale as the
 * instant-query hook, and the 30 s default was producing range queries
 * that effectively re-fetched the same window twice per scrape interval.
 */
export function usePrometheusRange(
  queries: RangeQuerySpec[],
  durationSeconds = 3600,
  stepSeconds = 60,
  pollInterval = 60000,
): UsePrometheusRangeResult {
  const [series, setSeries] = React.useState<TimeSeries[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [metricsAvailable, setMetricsAvailable] = React.useState(true);

  // Stable key for the dependency array — `queries` is typically an inline
  // array literal so its identity changes every render, but the actual
  // content is what we care about.
  const queriesKey = React.useMemo(
    () => queries.map((q) => q.query).join('|'),
    [queries],
  );

  usePollingEffect(
    async (signal) => {
      if (queries.length === 0) {
        setSeries([]);
        setLoaded(true);
        return;
      }
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
              const response = await consoleFetch(url, { signal }, 15_000);
              const json = await response.json();
              const values: [number, string][] = json?.data?.result?.[0]?.values || [];
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

        if (signal.aborted) return;
        setSeries(results);
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
    // Intentionally keying on the content hash; queries identity is unstable.
    [queriesKey, durationSeconds, stepSeconds],
    { intervalMs: pollInterval, enabled: metricsAvailable },
  );

  return { series, loaded, metricsAvailable };
}
