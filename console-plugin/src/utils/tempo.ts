/**
 * Deep-linking to the cluster's native Tempo trace explorer.
 *
 * Routes traffic into the OpenShift Console's **Observe → Traces** page
 * at `/observe/traces?...` instead of opening the Tempo gateway's
 * Jaeger UI in a new tab. Two reasons:
 *   1. UX consistency — operators land on the same trace explorer that
 *      Observe → Traces already exposes via the platform plugin, with
 *      the cluster identity propagated automatically.
 *   2. Auth — the embedded /observe/traces page reuses the Console's
 *      OAuth session; the Jaeger UI on `tempo-gateway` needed a token
 *      with `traces.read` on the tenant, which kube:admin doesn't
 *      necessarily have.
 *
 * The TempoStack CR still drives availability + tenant resolution.
 * When Tempo isn't installed, the hook returns `available: false` so
 * callers can render a disabled button + tooltip.
 */
import {
  useK8sWatchResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { usePluginConfig } from './pluginConfig';

const DEFAULT_TEMPO_NS = 'tempo';
const DEFAULT_TEMPO_STACK_NAME = 'tempo-rhcl';

interface TempoStackResource extends K8sResourceCommon {
  spec?: {
    tenants?: {
      authentication?: { tenantName: string }[];
    };
  };
}

/**
 * Search context the trace explorer should open with. Only `serviceName`
 * and `lookback` are honored by the native Observe → Traces query
 * params today; richer filters (`tags`, `minDurationMs`) are accepted
 * for API stability — when the platform plugin starts respecting them
 * we can pass them through without touching every call site.
 */
export interface TempoSearchVars {
  /** service.name to pre-fill the Filter dropdown. */
  serviceName?: string;
  /** Free-form tag filter (reserved for future use). */
  tags?: Record<string, string>;
  /** Min duration in ms (reserved for future use). */
  minDurationMs?: number;
  /** Lookback window — `5m`, `30m`, `1h`, … Default `1h`. */
  lookback?: string;
}

export interface TempoLink {
  /** Internal Console URL (`/observe/traces?...`), or null when unavailable. */
  url: string | null;
  /** True while the TempoStack lookup is in flight. */
  loading: boolean;
  /** False when Tempo isn't installed in this cluster. */
  available: boolean;
}

/**
 * Resolve the deep-link URL into the Console's Observe → Traces page,
 * pre-targeted at the right TempoStack + tenant.
 *
 * Returns `available: false` when no TempoStack lives in the resolved
 * namespace (operator missing, or stack not deployed yet).
 */
export function useTempoLink(vars: TempoSearchVars = {}): TempoLink {
  const { config } = usePluginConfig();
  const namespace = config.tempoNamespace || DEFAULT_TEMPO_NS;
  const stackName = config.tempoStackName || DEFAULT_TEMPO_STACK_NAME;

  const [stack, stackLoaded, stackErr] = useK8sWatchResource<TempoStackResource>({
    groupVersionKind: {
      group: 'tempo.grafana.com',
      version: 'v1alpha1',
      kind: 'TempoStack',
    },
    namespace,
    name: stackName,
    isList: false,
  });

  if (!stackLoaded && !stackErr) {
    return { url: null, loading: true, available: false };
  }
  if (stackErr || !stack) {
    return { url: null, loading: false, available: false };
  }

  // openshift-mode TempoStacks always have at least one tenant. We pick
  // the first one — every PoC cluster sticks with a single `dev` tenant.
  // When a deployment has multiple tenants the caller should expose a
  // picker; for now we match the existing convention used by Grafana
  // queries.
  const tenant = stack.spec?.tenants?.authentication?.[0]?.tenantName || 'dev';

  // Observe → Traces query params the Console plugin reads. Per the
  // route documented at /observe/traces:
  //   - namespace: TempoStack namespace
  //   - name:      TempoStack metadata.name
  //   - tenant:    tenant the search runs against
  //   - start:     lookback window (`30m`, `1h`, …) — not an absolute time
  const params = new URLSearchParams();
  params.set('namespace', namespace);
  params.set('name', stackName);
  params.set('tenant', tenant);
  params.set('start', vars.lookback || '1h');
  // `serviceName` isn't a documented query param yet but the native
  // page has a Service Name filter — leaving it on the URL is a no-op
  // today and a free win the day the platform plugin honors it.
  if (vars.serviceName) params.set('serviceName', vars.serviceName);

  const url = `/observe/traces?${params.toString()}`;
  return { url, loading: false, available: true };
}
