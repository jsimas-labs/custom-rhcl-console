/**
 * Runtime config for the plugin, sourced from a ConfigMap the cluster
 * admin maintains alongside the plugin Deployment.
 *
 *   apiVersion: v1
 *   kind: ConfigMap
 *   metadata:
 *     name: custom-rhcl-console-config
 *     namespace: custom-rhcl-console
 *   data:
 *     # Where the Grafana that hosts the RHCL dashboards lives. Defaults
 *     # to the in-cluster instance the role provisions (rhcl-grafana /
 *     # rhcl-grafana-route).
 *     grafanaNamespace: monitoring
 *     grafanaRouteName: grafana
 *     # UID prefix on the dashboards in *this* Grafana — leave default
 *     # ("rhcl-") when the cluster admin imported the role's dashboard
 *     # JSONs unchanged. Override to point at a renamed copy.
 *     grafanaDashboardPrefix: rhcl-
 *     # Tempo gateway (TempoStack openshift-mode). Default points at
 *     # the in-cluster TempoStack the observability role provisions.
 *     tempoNamespace: tempo
 *     tempoGatewayRouteName: tempo-tempo-rhcl-gateway
 *     tempoStackName: tempo-rhcl
 *     # Absolute URL of the customer's Developer Portal. When set, a
 *     # "Developer Portal" item appears in the plugin's sidebar that
 *     # opens the URL directly. Leave unset to hide the item entirely.
 *     developerPortalUrl: https://developer-portal.bb.com.br
 *     # req029 — Absolute URL of the customer's Red Hat Developer Hub
 *     # (Internal Developer Portal / Backstage). When set, an "Internal
 *     # Developer Hub" item appears in the sidebar linking to it. Same
 *     # opt-in behaviour as developerPortalUrl: unset ⇒ item hidden.
 *     # Point it at a customer-run RHDH when they already have one, or
 *     # at the instance the lab's developer_hub role provisions.
 *     internalDeveloperHubUrl: https://developer-hub.bb.com.br
 *     # req018 — Cost Monitoring.
 *     # `costCurrency` is shown next to monetary values. Leave unset to
 *     # default to "BRL". `costPricing` is a JSON-encoded record of tier
 *     # → {tokens_per_1k, calls_per_1k}; tier keys must match the
 *     # `secret.kuadrant.io/plan-id` annotation on the APIKey Secrets
 *     # (typically gold/silver/bronze + anonymous). Unset or empty ⇒
 *     # plugin hides the monetary column and only shows raw usage.
 *     costCurrency: BRL
 *     costPricing: '{"gold":{"tokens_per_1k":0.10,"calls_per_1k":0.05}, …}'
 *     # Absolute URL of the DNS Prober service (companion Quarkus app
 *     # under rhcl-lab/apps/backend/dns-prober). When set, the DNS
 *     # Troubleshooting page's resolver table shows LIVE cross-resolver
 *     # data from the prober instead of the simulated-status fallback.
 *     # Unset ⇒ the page renders a small callout with a link to the
 *     # install docs.
 *     dnsProberUrl: https://dns-prober-rhcl-apps.apps.example.com
 *
 * Every field is optional — the hooks fall back to the original
 * hard-coded values when the ConfigMap is missing or a field is unset,
 * so deploying without the ConfigMap is identical to today's behavior.
 *
 * Why a ConfigMap and not env vars: federated console plugins run in
 * the browser, so they can't read pod env — the only runtime config
 * channel available is the Kubernetes API.
 */
import {
  useK8sWatchResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

const CONFIG_NAMESPACE = 'custom-rhcl-console';
const CONFIG_NAME = 'custom-rhcl-console-config';

export interface PluginConfig {
  grafanaNamespace?: string;
  grafanaRouteName?: string;
  grafanaDashboardPrefix?: string;
  tempoNamespace?: string;
  tempoGatewayRouteName?: string;
  tempoStackName?: string;
  developerPortalUrl?: string;
  // req029 — Absolute URL of the customer's Red Hat Developer Hub
  // (Internal Developer Portal). Drives the conditional "Internal
  // Developer Hub" sidebar item, same opt-in shape as developerPortalUrl.
  internalDeveloperHubUrl?: string;
  // req018 — Cost Monitoring.
  costCurrency?: string;
  // JSON-encoded record<tierName, {tokens_per_1k, calls_per_1k}>.
  // Parsed by the CostMonitoring hook, kept as a string here so the
  // ConfigMap stays a flat string→string map (the K8s schema).
  costPricing?: string;
  /**
   * Optional monthly budget (numeric, in `costCurrency` units). When set,
   * the Cost Monitoring page surfaces a "Budget Usage" KPI with a
   * projected-month-end estimate. Leave unset to hide the card.
   * ConfigMap values are strings — the hook parses the number.
   */
  costBudget?: string | number;
  /**
   * Absolute base URL of an external DNS Prober service (the small
   * Quarkus companion from `rhcl-lab/apps/backend/dns-prober`). When
   * set, the DNS Troubleshooting page swaps its "Simulated" resolver
   * table for real cross-resolver probes from that service. When unset
   * the table renders a fallback callout explaining how to enable it.
   *
   * The plugin itself never bundles a prober — DNS lookups don't work
   * from a browser sandbox. A production install runs the prober in
   * the same cluster (route CORS-enabled for the console origin) and
   * points this field at the route.
   */
  dnsProberUrl?: string;
}

/**
 * Per-tier price multiplier the Cost Monitoring view applies on top of
 * raw usage. `tokens_per_1k` covers AI prompt + completion tokens
 * combined; `calls_per_1k` covers every HTTP call to the gateway.
 *
 * Tier keys are matched case-insensitively against the
 * `secret.kuadrant.io/plan-id` annotation on each APIKey Secret. An
 * unknown tier falls back to the `anonymous` entry if present, then to
 * zero pricing (raw usage only).
 */
export interface CostPricingTier {
  tokens_per_1k: number;
  calls_per_1k: number;
}
export type CostPricing = Record<string, CostPricingTier>;

/**
 * Parse the `costPricing` ConfigMap value defensively — operators edit
 * the ConfigMap by hand so we never trust the JSON shape blindly.
 * Returns an empty record (which the cost view treats as "show usage
 * only, no monetary column") for any unparseable / wrong-shaped value.
 */
export function parseCostPricing(raw?: string): CostPricing {
  if (!raw || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: CostPricing = {};
    for (const [tier, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue;
      const v = value as Record<string, unknown>;
      const tokens = typeof v.tokens_per_1k === 'number' ? v.tokens_per_1k : 0;
      const calls = typeof v.calls_per_1k === 'number' ? v.calls_per_1k : 0;
      out[tier.toLowerCase()] = { tokens_per_1k: tokens, calls_per_1k: calls };
    }
    return out;
  } catch {
    return {};
  }
}

interface ConfigMapResource extends K8sResourceCommon {
  data?: PluginConfig;
}

export interface PluginConfigResult {
  config: PluginConfig;
  loaded: boolean;
}

/**
 * Hook that watches the plugin's runtime ConfigMap. Returns an empty
 * object when missing — every caller falls back to its default.
 */
export function usePluginConfig(): PluginConfigResult {
  const [cm, loaded] = useK8sWatchResource<ConfigMapResource>({
    groupVersionKind: { version: 'v1', kind: 'ConfigMap' },
    namespace: CONFIG_NAMESPACE,
    name: CONFIG_NAME,
    isList: false,
  });
  return { config: cm?.data || {}, loaded };
}
