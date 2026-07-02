/**
 * Data contracts for the Overview dashboard.
 *
 * Each card/table/widget exports its own consumer-facing component but
 * the row/data shape comes from here so the live hooks
 * (useEnvironmentHealth, useOverviewTraffic, useNeedsAttention, …) and
 * the components stay aligned without circular imports.
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

/**
 * Discriminated union describing WHY a row shows up with a given status.
 * The renderer picks the right i18n key per shape — this lets the hook
 * carry structured data (target kind/name from the cluster) without
 * pre-interpolating strings that i18next would then see as unknown
 * keys ("Targeting HTTPRoute/banking-api-connectivity" was the
 * observed missing-key spam on customer clusters).
 */
export type PolicyImpact =
  | { kind: 'targeting'; targetKind: string; targetName: string }
  | { kind: 'accepted' }
  | { kind: 'overridden' }
  | { kind: 'not-accepted' }
  | { kind: 'no-target' };

export interface PolicyImpactRow {
  id: string;
  name: string;
  namespace: string;
  kind: string;
  typeLabel: string;
  status: 'enforced' | 'accepted' | 'overridden' | 'failed';
  impact: PolicyImpact;
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
