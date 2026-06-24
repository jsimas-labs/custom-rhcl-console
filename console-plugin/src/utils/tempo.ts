/**
 * Deep-linking into the cluster's Tempo gateway (openshift-mode).
 *
 * The Tempo gateway exposes the Jaeger-compatible search UI at
 *   `/api/traces/v1/{tenant}/`
 * and a structured search REST API at
 *   `/api/traces/v1/{tenant}/tempo/api/search`
 *
 * We auto-discover the Tempo gateway Route host and the tenant name from
 * the TempoStack CR. When Tempo isn't installed, the hook returns
 * `available: false` so callers can render a disabled button + tooltip
 * instead of a dead link.
 */
import {
  useK8sWatchResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

const TEMPO_NS = 'tempo';
const TEMPO_GATEWAY_ROUTE = 'tempo-tempo-rhcl-gateway';
const TEMPO_STACK_NAME = 'tempo-rhcl';

interface RouteResource extends K8sResourceCommon {
  spec?: { host?: string };
}

interface TempoStackResource extends K8sResourceCommon {
  spec?: {
    tenants?: {
      authentication?: { tenantName: string }[];
    };
  };
}

/**
 * Tempo gateway query filters. The hook builds a URL that opens the
 * Jaeger UI pre-filtered by these tags — typically a service.name (to
 * land on every span from the gateway, banking-api-v1, limitador, etc.)
 * plus optional duration/error filters when the caller wants to zoom in
 * on slow or failing requests.
 */
export interface TempoSearchVars {
  /**
   * service.name to filter by. Match the OTel resource attribute on the
   * span — for the gateway it's `rhcl-gateway`, for instrumented apps it
   * follows OTEL_SERVICE_NAME (which the OTel Operator sets to
   * `<deployment-name>` by default).
   */
  serviceName?: string;
  /** Free-form tag filter, e.g. `{"http.status_code":"500"}`. */
  tags?: Record<string, string>;
  /** Min duration in ms. */
  minDurationMs?: number;
  /** Lookback window (eg. "1h", "15m"). Defaults to 1h. */
  lookback?: string;
}

export interface TempoLink {
  /** Full https URL to the Jaeger UI on the Tempo gateway, or null when unavailable. */
  url: string | null;
  /** True while the Route/TempoStack lookups are in flight. */
  loading: boolean;
  /** False when Tempo isn't installed in this cluster. */
  available: boolean;
}

function tagsParam(tags: Record<string, string>): string {
  // Jaeger UI expects tags as JSON-encoded URL param: tags={"k":"v"}
  return JSON.stringify(tags);
}

/**
 * Resolve the deep-link URL to a pre-filtered Tempo trace search.
 *
 * Falls back to `available: false` when the Tempo gateway Route isn't
 * present (TempoStack not deployed, or operator not installed).
 */
export function useTempoLink(vars: TempoSearchVars = {}): TempoLink {
  const [route, routeLoaded, routeErr] = useK8sWatchResource<RouteResource>({
    groupVersionKind: { group: 'route.openshift.io', version: 'v1', kind: 'Route' },
    namespace: TEMPO_NS,
    name: TEMPO_GATEWAY_ROUTE,
    isList: false,
  });
  const [stack, stackLoaded] = useK8sWatchResource<TempoStackResource>({
    groupVersionKind: {
      group: 'tempo.grafana.com',
      version: 'v1alpha1',
      kind: 'TempoStack',
    },
    namespace: TEMPO_NS,
    name: TEMPO_STACK_NAME,
    isList: false,
  });

  if ((!routeLoaded && !routeErr) || !stackLoaded) {
    return { url: null, loading: true, available: false };
  }
  const host = route?.spec?.host;
  if (routeErr || !host) {
    return { url: null, loading: false, available: false };
  }

  // openshift-mode TempoStacks always have at least one tenant. We pick the
  // first one; in this lab there's a single `dev` tenant. When a deployment
  // has multiple tenants the caller should expose a picker; for now sticking
  // with the first matches the existing convention used by Grafana queries.
  const tenant = stack?.spec?.tenants?.authentication?.[0]?.tenantName || 'dev';

  const params = new URLSearchParams();
  if (vars.serviceName) params.set('service', vars.serviceName);
  if (vars.tags && Object.keys(vars.tags).length > 0) {
    params.set('tags', tagsParam(vars.tags));
  }
  if (vars.minDurationMs) params.set('minDuration', `${vars.minDurationMs}ms`);
  params.set('lookback', vars.lookback || '1h');
  params.set('limit', '20');

  const url = `https://${host}/api/traces/v1/${tenant}/search?${params.toString()}`;
  return { url, loading: false, available: true };
}
