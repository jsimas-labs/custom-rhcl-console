/**
 * Centralized mock data for the Overview dashboard.
 *
 * Mockup-first refactor (planned Phase 5: wire real Prometheus + k8s data).
 * Real data sources for each section:
 *   - Environment Health counts: useResourceWithRBAC over each GVK
 *   - Traffic metrics: usePrometheusTraffic (already exists)
 *   - Needs Attention: synthesized from policy.status.conditions +
 *     APIKey.status.phase=Pending + Backend probe results
 *   - Backend health: useBackendsStatus (already exists)
 *   - Recent Events: k8s Events API filtered by RHCL resource owners
 *
 * Keep mock shapes structurally identical to the eventual real types so
 * Phase 5 only swaps the source, not the component contracts.
 */

export type HealthSeverity = 'healthy' | 'warning' | 'critical' | 'info' | 'accepted';

export interface SparklinePoint {
  t: number;
  v: number;
}

export interface EnvironmentHealthBreakdown {
  label: string;
  count: number;
  severity: HealthSeverity;
}

export interface EnvironmentHealthCardData {
  id: string;
  title: string;
  total: number;
  breakdown: EnvironmentHealthBreakdown[];
  href: string;
}

export interface TrafficMetricData {
  id: string;
  label: string;
  value: string;
  trendDeltaPct: number;
  trendDirection: 'up' | 'down';
  trendIsGood: boolean;
  sparkline: SparklinePoint[];
}

export interface NeedsAttentionItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  href: string;
  occurredAt: string;
}

export interface GatewayOpData {
  id: string;
  name: string;
  namespace: string;
  health: HealthSeverity;
  requestsPerMin: number;
  successRatePct: number;
  errorRatePct: number;
  routesCount: number;
  policiesCount: number;
  href: string;
}

export interface PolicyImpactRow {
  id: string;
  name: string;
  namespace: string;
  kind: string;
  typeLabel: string;
  status: 'enforced' | 'accepted' | 'overridden' | 'failed';
  impact: string;
  href: string;
}

export interface RouteTrafficRow {
  id: string;
  name: string;
  namespace: string;
  gatewayName: string;
  requestsPerMin: number;
  errorRatePct: number;
  policiesCount: number;
  sparkline: SparklinePoint[];
  href: string;
}

export interface BackendRow {
  id: string;
  name: string;
  service: string;
  namespace: string;
  health: HealthSeverity;
  requestsPerMin: number;
  errorRatePct: number;
  sparkline: SparklinePoint[];
  href: string;
}

export interface RecentEvent {
  id: string;
  occurredAt: string;
  title: string;
  detail: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  href: string;
}

// Helpers --------------------------------------------------------------------

const sparkline = (vals: number[]): SparklinePoint[] =>
  vals.map((v, i) => ({ t: i, v }));

// Realistic gentle-trend generators
const trendUp = (base: number, jitter = 0.08): SparklinePoint[] =>
  sparkline(
    Array.from({ length: 30 }, (_, i) =>
      base * (1 + (i / 30) * 0.15 + (Math.sin(i / 3) * jitter)),
    ),
  );

const trendFlat = (base: number, jitter = 0.05): SparklinePoint[] =>
  sparkline(
    Array.from({ length: 30 }, (_, i) => base * (1 + Math.sin(i / 4) * jitter)),
  );

const trendDown = (base: number, jitter = 0.08): SparklinePoint[] =>
  sparkline(
    Array.from({ length: 30 }, (_, i) =>
      base * (1 - (i / 30) * 0.12 + (Math.cos(i / 3) * jitter)),
    ),
  );

// Mock data ------------------------------------------------------------------

export const MOCK_ENVIRONMENT_HEALTH: EnvironmentHealthCardData[] = [
  {
    id: 'gateways',
    title: 'Gateways',
    total: 3,
    breakdown: [
      { label: 'Healthy', count: 3, severity: 'healthy' },
      { label: 'Warning', count: 0, severity: 'warning' },
      { label: 'Degraded', count: 0, severity: 'critical' },
    ],
    href: '/k8s/all-namespaces/gateway.networking.k8s.io~v1~Gateway',
  },
  {
    id: 'httproutes',
    title: 'HTTPRoutes',
    total: 4,
    breakdown: [
      { label: 'Healthy', count: 4, severity: 'healthy' },
      { label: 'Warning', count: 0, severity: 'warning' },
      { label: 'Degraded', count: 0, severity: 'critical' },
    ],
    href: '/k8s/all-namespaces/gateway.networking.k8s.io~v1~HTTPRoute',
  },
  {
    id: 'policies',
    title: 'Policies',
    total: 7,
    breakdown: [
      { label: 'Enforced', count: 4, severity: 'healthy' },
      { label: 'Accepted', count: 2, severity: 'accepted' },
      { label: 'Overridden', count: 1, severity: 'info' },
    ],
    href: '#/policies',
  },
  {
    id: 'backends',
    title: 'Backends',
    total: 8,
    breakdown: [
      { label: 'Healthy', count: 7, severity: 'healthy' },
      { label: 'Warning', count: 1, severity: 'warning' },
      { label: 'Down', count: 0, severity: 'critical' },
    ],
    href: '#/backends',
  },
  {
    id: 'api-products',
    title: 'API Products',
    total: 3,
    breakdown: [
      { label: 'Published', count: 3, severity: 'healthy' },
      { label: 'Draft', count: 0, severity: 'info' },
      { label: 'Deprecated', count: 0, severity: 'warning' },
    ],
    href: '#/api-products',
  },
];

export const MOCK_TRAFFIC: TrafficMetricData[] = [
  {
    id: 'rps',
    label: 'Requests / sec',
    value: '8.4k',
    trendDeltaPct: 12,
    trendDirection: 'up',
    trendIsGood: true,
    sparkline: trendUp(8000, 0.1),
  },
  {
    id: 'success',
    label: 'Success Rate',
    value: '98.7%',
    trendDeltaPct: 1.3,
    trendDirection: 'up',
    trendIsGood: true,
    sparkline: trendUp(0.97, 0.005),
  },
  {
    id: 'errors',
    label: 'Error Rate',
    value: '1.3%',
    trendDeltaPct: 0.6,
    trendDirection: 'down',
    trendIsGood: true,
    sparkline: trendDown(0.018, 0.004),
  },
  {
    id: 'latency',
    label: 'P95 Latency',
    value: '120 ms',
    trendDeltaPct: 8,
    trendDirection: 'down',
    trendIsGood: true,
    sparkline: trendDown(140, 0.07),
  },
];

export const MOCK_NEEDS_ATTENTION: NeedsAttentionItem[] = [
  {
    id: 'na-1',
    severity: 'warning',
    title: 'Policy ipfilter-ip-acl is not enforced',
    detail: 'It is accepted but not attached to any route',
    href: '#/policies/ipfilter-ip-acl',
    occurredAt: '10m ago',
  },
  {
    id: 'na-2',
    severity: 'warning',
    title: 'DNS policy rhcl-apps-gateway-dns pending',
    detail: 'Waiting for reconciliation',
    href: '#/policies/rhcl-apps-gateway-dns',
    occurredAt: '25m ago',
  },
  {
    id: 'na-3',
    severity: 'critical',
    title: '12% errors detected on rhcl-apps-gateway',
    detail: 'Error rate is higher than the configured threshold (5%)',
    href: '#/gateways/rhcl-apps-gateway',
    occurredAt: '12m ago',
  },
  {
    id: 'na-4',
    severity: 'info',
    title: '3 API keys waiting approval',
    detail: 'Require your attention',
    href: '#/api-keys',
    occurredAt: '1h ago',
  },
];

export const MOCK_GATEWAYS: GatewayOpData[] = [
  {
    id: 'gw-1',
    name: 'rhcl-apps-gateway',
    namespace: 'openshift-ingress',
    health: 'healthy',
    requestsPerMin: 60013,
    successRatePct: 88,
    errorRatePct: 12,
    routesCount: 2,
    policiesCount: 3,
    href: '#/gateways/rhcl-apps-gateway',
  },
  {
    id: 'gw-2',
    name: 'data-science-gateway',
    namespace: 'redhat-ods-applications',
    health: 'healthy',
    requestsPerMin: 15443,
    successRatePct: 99.2,
    errorRatePct: 0.8,
    routesCount: 1,
    policiesCount: 2,
    href: '#/gateways/data-science-gateway',
  },
  {
    id: 'gw-3',
    name: 'rhcl-mcp-gateway',
    namespace: 'mcp-gateway',
    health: 'warning',
    requestsPerMin: 34,
    successRatePct: 0,
    errorRatePct: 100,
    routesCount: 0,
    policiesCount: 1,
    href: '#/gateways/rhcl-mcp-gateway',
  },
];

export const MOCK_POLICIES: PolicyImpactRow[] = [
  {
    id: 'pol-1',
    name: 'banking-api-apikey',
    namespace: 'rhcl-apps',
    kind: 'AuthPolicy',
    typeLabel: 'Authentication',
    status: 'enforced',
    impact: 'Protecting 1 route',
    href: '#/policies/banking-api-apikey',
  },
  {
    id: 'pol-2',
    name: 'ipfilter-ip-acl',
    namespace: 'rhcl-apps',
    kind: 'AuthPolicy',
    typeLabel: 'IP Filtering',
    status: 'accepted',
    impact: 'Not attached',
    href: '#/policies/ipfilter-ip-acl',
  },
  {
    id: 'pol-3',
    name: 'rhcl-apps-gateway-dns',
    namespace: 'openshift-ingress',
    kind: 'DNSPolicy',
    typeLabel: 'DNS',
    status: 'accepted',
    impact: 'Pending',
    href: '#/policies/rhcl-apps-gateway-dns',
  },
  {
    id: 'pol-4',
    name: 'rhcl-apps-gateway-deny-all',
    namespace: 'openshift-ingress',
    kind: 'AuthPolicy',
    typeLabel: 'Authentication',
    status: 'overridden',
    impact: 'Overridden by route',
    href: '#/policies/rhcl-apps-gateway-deny-all',
  },
  {
    id: 'pol-5',
    name: 'rhcl-mcp-gateway-deny-all',
    namespace: 'mcp-gateway',
    kind: 'AuthPolicy',
    typeLabel: 'Authentication',
    status: 'accepted',
    impact: 'Not attached',
    href: '#/policies/rhcl-mcp-gateway-deny-all',
  },
];

export const MOCK_ROUTES: RouteTrafficRow[] = [
  {
    id: 'rt-1',
    name: 'banking-api-connectivity',
    namespace: 'rhcl-apps',
    gatewayName: 'rhcl-apps-gateway',
    requestsPerMin: 6200,
    errorRatePct: 0.8,
    policiesCount: 4,
    sparkline: trendUp(6000, 0.08),
    href: '#/httproutes/banking-api-connectivity',
  },
  {
    id: 'rt-2',
    name: 'ipfilter',
    namespace: 'rhcl-apps',
    gatewayName: 'rhcl-apps-gateway',
    requestsPerMin: 1200,
    errorRatePct: 0,
    policiesCount: 1,
    sparkline: trendFlat(1200, 0.06),
    href: '#/httproutes/ipfilter',
  },
  {
    id: 'rt-3',
    name: 'oauth-callback-route',
    namespace: 'openshift-ingress',
    gatewayName: 'rhcl-apps-gateway',
    requestsPerMin: 320,
    errorRatePct: 0,
    policiesCount: 2,
    sparkline: trendFlat(320, 0.05),
    href: '#/httproutes/oauth-callback-route',
  },
  {
    id: 'rt-4',
    name: 'rhods-dashboard',
    namespace: 'redhat-ods-applications',
    gatewayName: 'data-science-gateway',
    requestsPerMin: 210,
    errorRatePct: 0,
    policiesCount: 1,
    sparkline: trendFlat(210, 0.07),
    href: '#/httproutes/rhods-dashboard',
  },
];

export const MOCK_BACKENDS: BackendRow[] = [
  {
    id: 'be-1',
    name: 'banking-api-v1',
    service: 'banking-api-v1',
    namespace: 'rhcl-apps',
    health: 'healthy',
    requestsPerMin: 4100,
    errorRatePct: 0.7,
    sparkline: trendUp(4000, 0.06),
    href: '#/backends/banking-api-v1',
  },
  {
    id: 'be-2',
    name: 'banking-api-v2',
    service: 'banking-api-v2',
    namespace: 'rhcl-apps',
    health: 'healthy',
    requestsPerMin: 1800,
    errorRatePct: 0.6,
    sparkline: trendUp(1700, 0.07),
    href: '#/backends/banking-api-v2',
  },
  {
    id: 'be-3',
    name: 'ml-model-api',
    service: 'ml-model-api',
    namespace: 'rhcl-ml',
    health: 'warning',
    requestsPerMin: 430,
    errorRatePct: 4.2,
    sparkline: trendFlat(420, 0.08),
    href: '#/backends/ml-model-api',
  },
  {
    id: 'be-4',
    name: 'chat-service',
    service: 'chat-service',
    namespace: 'rhcl-apps',
    health: 'healthy',
    requestsPerMin: 250,
    errorRatePct: 0.2,
    sparkline: trendFlat(250, 0.05),
    href: '#/backends/chat-service',
  },
];

export const MOCK_EVENTS: RecentEvent[] = [
  {
    id: 'ev-1',
    occurredAt: '2m ago',
    title: 'API Key approved',
    detail: 'alice@bb.com.br (Gold Plan) has been approved',
    severity: 'success',
    href: '#/api-keys/alice',
  },
  {
    id: 'ev-2',
    occurredAt: '12m ago',
    title: 'Policy updated',
    detail: 'Rate limit policy gold-tier has been updated',
    severity: 'info',
    href: '#/policies/gold-tier',
  },
  {
    id: 'ev-3',
    occurredAt: '28m ago',
    title: 'Backend warning',
    detail: 'ml-model-api latency p95 is above the threshold (p95 > 500ms)',
    severity: 'warning',
    href: '#/backends/ml-model-api',
  },
  {
    id: 'ev-4',
    occurredAt: '1h ago',
    title: 'HTTPRoute created',
    detail: 'oauth-callback-route has been created',
    severity: 'info',
    href: '#/httproutes/oauth-callback-route',
  },
];
