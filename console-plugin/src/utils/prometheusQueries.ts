/**
 * PromQL query builders for Istio Gateway API traffic metrics.
 *
 * Source of truth: `istio_requests_total` (and the duration histogram
 * `istio_request_duration_milliseconds_bucket`), scraped by user-workload
 * monitoring on every cluster running Sail Operator / Istio (RHCL ships
 * with this enabled). The plugin previously queried Envoy's raw
 * `envoy_http_downstream_rq_total`, which the OpenShift Gateway pods do
 * NOT emit at the user-workload scrape — every query returned zero, so
 * the Metrics tab on Gateway / HTTPRoute / API Product detail rendered
 * "-" everywhere. Moving to the canonical Istio metric names fixed it.
 *
 * Label conventions (verified on cluster1, see req041 Telemetry CR):
 *   - HTTPRoute attachment is exposed as `route_name`, which Istio sets
 *     to `<httproute-ns>.<httproute-name>.<rule-index>` (e.g.
 *     `rhcl-apps.banking-api-connectivity.0`). To aggregate across all
 *     rules of one HTTPRoute we match `route_name=~"<ns>\\.<name>\\..*"`.
 *   - Gateway-level series carry `source_canonical_service` set to
 *     `<gateway-name>-<gatewayclass>` (e.g.
 *     `rhcl-apps-gateway-openshift-default`), again per Istio's auto-
 *     generated naming. Match `source_canonical_service=~"<name>-.*"`.
 *   - Response status is `response_code` (NOT `envoy_response_code` —
 *     that's a different metric family).
 *   - Latency histogram bucket label is `le` as usual; same selectors.
 *
 * This file deliberately keeps no special knowledge of the req041
 * Telemetry CR overrides (`request_url_path`, `request_headers_x_consumer_id`)
 * — those exist as additional labels on the same series, available for
 * future per-path / per-consumer dashboards without touching this code.
 */

/**
 * Label selector that pins a query to a given Gateway/HTTPRoute target.
 *
 * Centralised because every query below needs the same matcher and any
 * future label rename / reformat happens in one place.
 *
 * Escaping note: dots in the HTTPRoute namespace/name are escaped as
 * `\\.` so the regex matches the literal dot in the `route_name` label.
 * Promql expects a JS string `\\.`, which in the JSON wire format
 * becomes `\.` (a single regex escape).
 */
function targetSelector(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
): string {
  if (kind === 'Gateway') {
    // Gateway pod lives in `namespace`; canonical service starts with the
    // Gateway resource name. Pinning namespace too prevents false matches
    // when two clusters/namespaces reuse a gateway name.
    return `namespace="${namespace}", source_canonical_service=~"${name}-.*", reporter="source"`;
  }
  // HTTPRoute: `route_name` is `<ns>.<name>.<ruleIdx>` and the metric is
  // reported by the gateway pod (so its own `namespace` label is the
  // ingress ns, NOT the HTTPRoute ns). We therefore match only on
  // `route_name`, which is globally unique enough by itself.
  return `route_name=~"${namespace}\\\\.${name}\\\\..*", reporter="source"`;
}

export function requestRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window: '1m' | '5m' | '15m' | '1h' = '5m',
): string {
  return `sum(rate(istio_requests_total{${targetSelector(namespace, name, kind)}}[${window}]))`;
}

export function statusCodeRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  codeClass: '2xx' | '4xx' | '5xx',
  window = '5m',
): string {
  const codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
  return `sum(rate(istio_requests_total{${targetSelector(namespace, name, kind)}, response_code=~"${codePattern}"}[${window}]))`;
}

export function latencyPercentileQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  percentile: 0.5 | 0.95 | 0.99,
  window = '5m',
): string {
  return `histogram_quantile(${percentile}, sum(rate(istio_request_duration_milliseconds_bucket{${targetSelector(namespace, name, kind)}}[${window}])) by (le))`;
}

export function successRateQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window = '5m',
): string {
  const sel = targetSelector(namespace, name, kind);
  return `sum(rate(istio_requests_total{${sel}, response_code=~"[23].."}[${window}])) / sum(rate(istio_requests_total{${sel}}[${window}])) * 100`;
}

export function trafficOverTimeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  window = '5m',
): string {
  return `sum(rate(istio_requests_total{${targetSelector(namespace, name, kind)}}[${window}]))`;
}

export function statusCodeRateRangeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  codeClass: '2xx' | '4xx' | '5xx',
  window = '5m',
): string {
  const codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
  return `sum(rate(istio_requests_total{${targetSelector(namespace, name, kind)}, response_code=~"${codePattern}"}[${window}]))`;
}

/**
 * Top-N consumers (API key identities) by request rate over `window`.
 *
 * Relies on the Telemetry CR (req041) override that maps Istio's
 * `request.headers['x-consumer-id']` to the Prometheus label
 * `request_headers_x_consumer_id`. The header itself is injected by
 * the AuthPolicy on successful auth (selector `auth.identity.metadata.name`,
 * which resolves to the Secret name backing an API key, e.g.
 * `banking-api-key-alice`). When the header is absent (anonymous, JWT
 * routes without the injection, or pre-fix traffic) the label shows
 * "unknown" — we drop that bucket so the ranking is meaningful.
 *
 * `topk(k, ...)` keeps the highest-k buckets per scrape; `sum by (...)`
 * collapses each consumer's series across paths/response codes.
 */
export function topConsumersByRouteQuery(
  namespace: string,
  name: string,
  topN = 5,
  window = '1h',
): string {
  return `topk(${topN}, sum by (request_headers_x_consumer_id) (rate(istio_requests_total{route_name=~"${namespace}\\\\.${name}\\\\..*", reporter="source", request_headers_x_consumer_id!="unknown", request_headers_x_consumer_id!=""}[${window}])))`;
}

export function latencyPercentileRangeQuery(
  namespace: string,
  name: string,
  kind: 'Gateway' | 'HTTPRoute',
  percentile: 0.5 | 0.95 | 0.99,
  window = '5m',
): string {
  return `histogram_quantile(${percentile}, sum(rate(istio_request_duration_milliseconds_bucket{${targetSelector(namespace, name, kind)}}[${window}])) by (le))`;
}
