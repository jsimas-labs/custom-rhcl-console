/**
 * PromQL query builders for Envoy sidecar metrics.
 * These target the metrics already scraped by RHCL user-workload monitoring.
 */

export function requestRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window: '1m' | '5m' = '5m',
): string {
  if (kind === 'Gateway') {
    return `sum(rate(envoy_http_downstream_rq_total{namespace="${namespace}", gateway_name="${name}"}[${window}]))`;
  }
  return `sum(rate(envoy_http_downstream_rq_total{namespace="${namespace}", route_name="${name}"}[${window}]))`;
}

export function statusCodeRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  codeClass: '2xx' | '4xx' | '5xx',
  window = '5m',
): string {
  const codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  return `sum(rate(envoy_http_downstream_rq_total{namespace="${namespace}", ${labelKey}="${name}", envoy_response_code=~"${codePattern}"}[${window}]))`;
}

export function latencyPercentileQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  percentile: 0.5 | 0.95 | 0.99,
  window = '5m',
): string {
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  return `histogram_quantile(${percentile}, sum(rate(envoy_http_downstream_rq_time_bucket{namespace="${namespace}", ${labelKey}="${name}"}[${window}])) by (le))`;
}

export function successRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window = '5m',
): string {
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  const base = `envoy_http_downstream_rq_total{namespace="${namespace}", ${labelKey}="${name}"}`;
  return `sum(rate(${base.replace('}', ', envoy_response_code=~"[23].."}')}[${window}])) / sum(rate(${base}[${window}])) * 100`;
}

export function trafficOverTimeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window = '5m',
): string {
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  return `sum(rate(envoy_http_downstream_rq_total{namespace="${namespace}", ${labelKey}="${name}"}[${window}]))`;
}

export function statusCodeRateRangeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  codeClass: '2xx' | '4xx' | '5xx',
  window = '5m',
): string {
  const codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  return `sum(rate(envoy_http_downstream_rq_total{namespace="${namespace}", ${labelKey}="${name}", envoy_response_code=~"${codePattern}"}[${window}]))`;
}

export function latencyPercentileRangeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  percentile: 0.5 | 0.95 | 0.99,
  window = '5m',
): string {
  const labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
  return `histogram_quantile(${percentile}, sum(rate(envoy_http_downstream_rq_time_bucket{namespace="${namespace}", ${labelKey}="${name}"}[${window}])) by (le))`;
}
