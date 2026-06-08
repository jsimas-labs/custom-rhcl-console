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

// ---------------------------------------------------------------------------
// Per-backend metrics for the HTTPRoute Backends tab.
//
// Why a separate function instead of reusing requestRateQuery: this is scoped
// to a specific (route, backend Service) pair, which the HTTPRoute-level
// queries above can't express. The labels come from the canonical Istio
// telemetry pipeline that the RHCL Telemetry CR already configures:
//
//   - `route_name`: Istio gateway controller writes this as
//     `<route-ns>.<route-name>.<rule-idx>` when the gateway is a Gateway API
//     listener. Regex match covers every rule of the route.
//   - `destination_service_name` / `destination_service_namespace`: standard
//     Istio destination labels — identify which Service the request landed on.
//   - `reporter="source"`: dedup. Istio reports each request from both source
//     and destination workloads; the source side has the full route context
//     (the destination side won't have route_name).
//
// Backslashes in the regex are double-escaped because the JS string literal
// eats one layer before PromQL sees it.
// ---------------------------------------------------------------------------

function backendSelector(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
): string {
  return [
    `route_name=~"${routeNamespace}\\\\.${routeName}\\\\..*"`,
    `destination_service_name="${backendName}"`,
    `destination_service_namespace="${backendNamespace}"`,
    `reporter="source"`,
  ].join(', ');
}

export function routeBackendRequestRateQuery(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
  window = '5m',
): string {
  return `sum(rate(istio_requests_total{${backendSelector(routeNamespace, routeName, backendNamespace, backendName)}}[${window}]))`;
}

export function routeBackendSuccessRateQuery(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
  window = '5m',
): string {
  const sel = backendSelector(routeNamespace, routeName, backendNamespace, backendName);
  return `sum(rate(istio_requests_total{${sel}, response_code=~"[23].."}[${window}])) / sum(rate(istio_requests_total{${sel}}[${window}])) * 100`;
}

export function routeBackendErrorRateQuery(
  routeNamespace: string,
  routeName: string,
  backendNamespace: string,
  backendName: string,
  window = '5m',
): string {
  return `sum(rate(istio_requests_total{${backendSelector(routeNamespace, routeName, backendNamespace, backendName)}, response_code=~"5.."}[${window}]))`;
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
