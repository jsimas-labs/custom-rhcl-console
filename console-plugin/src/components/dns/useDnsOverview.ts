import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DNSPolicyGVK,
  DNSRecordGVK,
  GatewayGVK,
} from '../../models';

/**
 * Aggregation hook for the DNS Overview page. Watches DNSPolicy +
 * DNSRecord + Gateway + Events, joins them, and derives everything the
 * KPI cards / table / bottom widgets consume. Same shape as the TLS
 * Overview hook — one row per DNSRecord, KPI counters, distribution
 * buckets, provider slices, recent events.
 *
 * Note on "public resolution": we do NOT probe every hostname on page
 * load — that would fire N × 8 HTTP calls against the companion. The
 * KPI card and widget report predicted state (Ready condition + record
 * age) so the operator sees the picture immediately. The
 * troubleshooting page still runs real per-resolver probes.
 */

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface StatusCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
}
interface WithConditions extends K8sResourceCommon {
  status?: { conditions?: StatusCondition[] };
}

interface DNSPolicyResource extends WithConditions {
  spec?: {
    targetRef?: { group?: string; kind?: string; name?: string };
    providerRefs?: Array<{ name?: string }>;
  };
}

interface DNSRecordEndpoint {
  dnsName?: string;
  recordType?: string;
  targets?: string[];
  recordTTL?: number;
  labels?: Record<string, string>;
}
interface DNSRecordResource extends WithConditions {
  spec?: {
    rootHost?: string;
    endpoints?: DNSRecordEndpoint[];
    providerRef?: { name?: string };
  };
  status?: {
    conditions?: StatusCondition[];
    queuedAt?: string;
    ownerID?: string;
    endpoints?: DNSRecordEndpoint[];
  };
}

interface GatewayListener {
  name?: string;
  hostname?: string;
  port?: number;
  protocol?: string;
}
interface GatewayResource extends K8sResourceCommon {
  spec?: { listeners?: GatewayListener[] };
}

interface EventLike extends K8sResourceCommon {
  reason?: string;
  message?: string;
  type?: string;
  eventTime?: string;
  lastTimestamp?: string;
  firstTimestamp?: string;
  involvedObject?: { kind?: string; name?: string; namespace?: string };
}

export type DnsHealthStatus = 'healthy' | 'propagating' | 'failed' | 'unknown';
export type DnsResolutionStatus = 'resolved' | 'unresolved' | 'unknown';

export interface DnsRecordRow {
  id: string;
  hostname: string;
  recordName: string;
  namespace: string;
  gatewayName?: string;
  gatewayNamespace?: string;
  recordType: string;
  target: string;
  targets: string[];
  providerLabel: string;
  status: DnsHealthStatus;
  /** Rough propagation completeness — 0-100. Derived from Ready
   *  condition + age since queuedAt. */
  propagationPct: number;
  /** Predicted public resolution status. See file header. */
  resolution: DnsResolutionStatus;
  resolutionPct: number;
  lastCheckedIso?: string;
  href: {
    troubleshooting: string;
    record: string;
    gateway?: string;
  };
}

export interface DnsKpiCounts {
  overall: {
    total: number;
    healthy: number;
    propagating: number;
    failed: number;
    unknown: number;
  };
  propagation: {
    inProgress: number;
    under5min: number;
    from5to15min: number;
    over15min: number;
  };
  publicResolution: {
    /** Aggregate success rate across records (predicted). */
    successRatePct: number;
    resolved: number;
    failed: number;
    unknown: number;
  };
  providerSync: {
    providers: number;
    healthy: number;
    issues: number;
    unknown: number;
  };
}

export interface PropagationBucket {
  key: '0-1min' | '1-5min' | '5-15min' | '15-30min' | '>30min' | 'failed';
  label: string;
  count: number;
  severity: 'healthy' | 'warning' | 'critical';
}

export interface ProviderSlice {
  label: string;
  count: number;
}

export interface ResolverAggregate {
  label: string;
  successRatePct: number;
  ip: string;
}

export interface DnsOverviewEvent {
  id: string;
  when: string;
  kind: 'healthy' | 'propagating' | 'failed' | 'provider-sync' | 'other';
  title: string;
  detail?: string;
  hostname?: string;
  href?: string;
}

export interface DnsOverviewResult {
  loading: boolean;
  rows: DnsRecordRow[];
  kpi: DnsKpiCounts;
  propagationBuckets: PropagationBucket[];
  providerSlices: ProviderSlice[];
  recentEvents: DnsOverviewEvent[];
  filters: {
    gateways: string[];
    providers: string[];
    namespaces: string[];
  };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function findCondition(conds: StatusCondition[] | undefined, type: string): StatusCondition | undefined {
  return (conds || []).find((c) => c.type === type);
}

function inferProvider(secretName?: string): string {
  if (!secretName) return 'Not configured';
  const s = secretName.toLowerCase();
  if (s.includes('aws') || s.includes('route53')) return 'AWS Route 53';
  if (s.includes('gcp') || s.includes('google')) return 'Google Cloud DNS';
  if (s.includes('azure')) return 'Azure DNS';
  if (s.includes('cloudflare')) return 'Cloudflare';
  if (s.includes('internal') || s.includes('coredns')) return 'Internal DNS';
  return `Custom (${secretName})`;
}

/** DNSRecord state classification. */
function recordHealth(
  record: DNSRecordResource,
  ageSec: number,
): DnsHealthStatus {
  const ready = findCondition(record.status?.conditions, 'Ready');
  if (ready?.status === 'True') return 'healthy';
  if (ready?.status === 'False') {
    // A False Ready that's been sitting False for a while is broken;
    // young ones are still propagating.
    if (ageSec < 15 * 60) return 'propagating';
    return 'failed';
  }
  // No condition yet — probably still being reconciled.
  if (ageSec < 60) return 'propagating';
  return 'unknown';
}

/** Rough %-complete for the propagation card + progress bar. */
function propagationCompleteness(status: DnsHealthStatus, ageSec: number): number {
  if (status === 'healthy') return 100;
  if (status === 'failed') return 0;
  if (status === 'unknown') return 0;
  // propagating: interpolate 20 → 90 over 0-15 min.
  const fifteen = 15 * 60;
  const clamped = Math.min(ageSec, fifteen);
  return Math.round(20 + (clamped / fifteen) * 70);
}

function propagationBucket(
  status: DnsHealthStatus,
  ageSec: number,
): PropagationBucket['key'] {
  if (status === 'failed') return 'failed';
  if (ageSec < 60) return '0-1min';
  if (ageSec < 5 * 60) return '1-5min';
  if (ageSec < 15 * 60) return '5-15min';
  if (ageSec < 30 * 60) return '15-30min';
  return '>30min';
}

function gatewayFor(
  policy: DNSPolicyResource | undefined,
  gateways: GatewayResource[] | undefined,
  namespace: string,
): GatewayResource | undefined {
  if (!policy?.spec?.targetRef || !gateways) return undefined;
  const ref = policy.spec.targetRef;
  return gateways.find((g) =>
    g.metadata?.name === ref.name &&
    (g.metadata?.namespace || '') === namespace,
  );
}

/** Best-effort DNSPolicy that produced this DNSRecord. Kuadrant
 *  usually names the record `<gateway>-<listener>` and puts it in the
 *  same namespace as the Gateway; the DNSPolicy targets the Gateway.
 *  We match by looking for a policy in the same namespace whose
 *  target's name is a prefix of the DNSRecord name. */
function policyFor(
  record: DNSRecordResource,
  policies: DNSPolicyResource[] | undefined,
): DNSPolicyResource | undefined {
  if (!policies) return undefined;
  const ns = record.metadata?.namespace;
  const name = record.metadata?.name || '';
  return policies.find((p) => {
    if (p.metadata?.namespace !== ns) return false;
    const targetName = p.spec?.targetRef?.name;
    if (!targetName) return false;
    return name.startsWith(targetName);
  });
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

export function useDnsOverview(): DnsOverviewResult {
  const [dnsPolicies, dnsPoliciesLoaded] = useK8sWatchResource<DNSPolicyResource[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [dnsRecords, dnsRecordsLoaded] = useK8sWatchResource<DNSRecordResource[]>({
    groupVersionKind: DNSRecordGVK,
    isList: true,
  });
  const [gateways, gwLoaded] = useK8sWatchResource<GatewayResource[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });
  const [events, eventsLoaded] = useK8sWatchResource<EventLike[]>({
    groupVersionKind: { version: 'v1', kind: 'Event' },
    isList: true,
  });

  return React.useMemo<DnsOverviewResult>(() => {
    const loading = !dnsPoliciesLoaded || !dnsRecordsLoaded || !gwLoaded || !eventsLoaded;

    // ---------------- rows ----------------
    const rows: DnsRecordRow[] = [];
    const now = Date.now();
    for (const rec of dnsRecords || []) {
      const hostname = rec.spec?.rootHost || rec.metadata?.name || '';
      const created = rec.metadata?.creationTimestamp;
      const ageSec = created
        ? Math.max(0, Math.floor((now - new Date(created).getTime()) / 1000))
        : 0;
      const status = recordHealth(rec, ageSec);
      const propagationPct = propagationCompleteness(status, ageSec);
      const policy = policyFor(rec, dnsPolicies);
      const providerLabel = inferProvider(policy?.spec?.providerRefs?.[0]?.name);
      const gw = gatewayFor(policy, gateways, rec.metadata?.namespace || '');
      const endpoint = rec.spec?.endpoints?.[0];
      const recordType = endpoint?.recordType || 'A';
      const targets = endpoint?.targets || [];
      const target = targets[0] || '—';
      const readyCond = findCondition(rec.status?.conditions, 'Ready');
      const lastCheckedIso =
        rec.status?.queuedAt || readyCond?.lastTransitionTime || created;
      const resolution: DnsResolutionStatus =
        status === 'healthy' ? 'resolved' : status === 'failed' ? 'unresolved' : 'unknown';
      const resolutionPct = status === 'healthy' ? 100 : status === 'failed' ? 0 : 60;

      rows.push({
        id: `${rec.metadata?.namespace}/${rec.metadata?.name}`,
        hostname,
        recordName: rec.metadata?.name || '',
        namespace: rec.metadata?.namespace || '',
        gatewayName: gw?.metadata?.name,
        gatewayNamespace: gw?.metadata?.namespace,
        recordType,
        target,
        targets,
        providerLabel,
        status,
        propagationPct,
        resolution,
        resolutionPct,
        lastCheckedIso,
        href: {
          troubleshooting: `/connectivity-link/dns/troubleshooting?hostname=${encodeURIComponent(hostname)}`,
          record: `/k8s/ns/${rec.metadata?.namespace}/kuadrant.io~v1alpha1~DNSRecord/${rec.metadata?.name}`,
          gateway: gw
            ? `/connectivity-link/gateways/${gw.metadata?.namespace}/${gw.metadata?.name}`
            : undefined,
        },
      });
    }

    // Sort failed → propagating → unknown → healthy (worst first).
    const statusOrder: Record<DnsHealthStatus, number> = {
      failed: 0, propagating: 1, unknown: 2, healthy: 3,
    };
    rows.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // ---------------- KPI ----------------
    const kpi: DnsKpiCounts = {
      overall: { total: rows.length, healthy: 0, propagating: 0, failed: 0, unknown: 0 },
      propagation: { inProgress: 0, under5min: 0, from5to15min: 0, over15min: 0 },
      publicResolution: { successRatePct: 0, resolved: 0, failed: 0, unknown: 0 },
      providerSync: { providers: 0, healthy: 0, issues: 0, unknown: 0 },
    };

    for (const r of rows) {
      kpi.overall[r.status]++;
      if (r.status === 'propagating') {
        kpi.propagation.inProgress++;
        const rec = (dnsRecords || []).find((d) => d.metadata?.uid === undefined ? false : true) && dnsRecords![rows.indexOf(r)];
        // Fallback: use lastChecked
        const iso = r.lastCheckedIso;
        if (iso) {
          const ageSec = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
          if (ageSec < 5 * 60) kpi.propagation.under5min++;
          else if (ageSec < 15 * 60) kpi.propagation.from5to15min++;
          else kpi.propagation.over15min++;
        } else {
          kpi.propagation.under5min++;
        }
        void rec;
      }
      if (r.resolution === 'resolved') kpi.publicResolution.resolved++;
      else if (r.resolution === 'unresolved') kpi.publicResolution.failed++;
      else kpi.publicResolution.unknown++;
    }
    kpi.publicResolution.successRatePct =
      rows.length > 0 ? Math.round((kpi.publicResolution.resolved / rows.length) * 100) : 0;

    // Provider sync — count distinct providers + per-provider health.
    const perProvider = new Map<string, { total: number; healthy: number }>();
    for (const r of rows) {
      const p = perProvider.get(r.providerLabel) || { total: 0, healthy: 0 };
      p.total++;
      if (r.status === 'healthy') p.healthy++;
      perProvider.set(r.providerLabel, p);
    }
    for (const [, v] of perProvider.entries()) {
      kpi.providerSync.providers++;
      if (v.healthy === v.total) kpi.providerSync.healthy++;
      else if (v.healthy < v.total) kpi.providerSync.issues++;
      else kpi.providerSync.unknown++;
    }

    // ---------------- propagation buckets ----------------
    const bucketOrder: PropagationBucket['key'][] = [
      '0-1min', '1-5min', '5-15min', '15-30min', '>30min', 'failed',
    ];
    const labelFor: Record<PropagationBucket['key'], string> = {
      '0-1min': '0-1 min',
      '1-5min': '1-5 min',
      '5-15min': '5-15 min',
      '15-30min': '15-30 min',
      '>30min': '> 30 min',
      failed: 'Failed',
    };
    const severityFor: Record<PropagationBucket['key'], PropagationBucket['severity']> = {
      '0-1min': 'healthy',
      '1-5min': 'healthy',
      '5-15min': 'warning',
      '15-30min': 'warning',
      '>30min': 'critical',
      failed: 'critical',
    };
    const bucketCounts = new Map<PropagationBucket['key'], number>();
    for (const rec of dnsRecords || []) {
      const created = rec.metadata?.creationTimestamp;
      const ageSec = created
        ? Math.max(0, Math.floor((now - new Date(created).getTime()) / 1000))
        : 0;
      const status = recordHealth(rec, ageSec);
      const k = propagationBucket(status, ageSec);
      bucketCounts.set(k, (bucketCounts.get(k) || 0) + 1);
    }
    const propagationBuckets: PropagationBucket[] = bucketOrder.map((k) => ({
      key: k,
      label: labelFor[k],
      count: bucketCounts.get(k) || 0,
      severity: severityFor[k],
    }));

    // ---------------- provider slices ----------------
    const providerCounts = new Map<string, number>();
    for (const r of rows) {
      providerCounts.set(r.providerLabel, (providerCounts.get(r.providerLabel) || 0) + 1);
    }
    const providerSlices: ProviderSlice[] = [...providerCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // ---------------- recent events ----------------
    const recent: DnsOverviewEvent[] = [];
    for (const rec of dnsRecords || []) {
      for (const c of rec.status?.conditions || []) {
        if (!c.lastTransitionTime) continue;
        if (c.type !== 'Ready') continue;
        let kind: DnsOverviewEvent['kind'] = 'other';
        let title = '';
        const host = rec.spec?.rootHost || rec.metadata?.name;
        if (c.status === 'True') {
          kind = 'healthy';
          title = `Record ${host} is healthy`;
        } else if (c.status === 'False') {
          kind = 'failed';
          title = `Record ${host} failed`;
        } else {
          kind = 'propagating';
          title = `Record ${host} propagating`;
        }
        recent.push({
          id: `${rec.metadata?.namespace}/${rec.metadata?.name}/${c.type}/${c.lastTransitionTime}`,
          when: c.lastTransitionTime,
          kind,
          title,
          detail: c.message || c.reason,
          hostname: host,
          href: `/connectivity-link/dns/troubleshooting?hostname=${encodeURIComponent(host || '')}`,
        });
      }
    }

    for (const e of events || []) {
      if (!e.involvedObject) continue;
      const kind = e.involvedObject.kind;
      if (kind !== 'DNSPolicy' && kind !== 'DNSRecord') continue;
      const when = e.lastTimestamp || e.eventTime || e.firstTimestamp;
      if (!when) continue;
      recent.push({
        id: `evt-${e.metadata?.namespace}/${e.metadata?.name}`,
        when,
        kind: (e.type === 'Warning' ? 'failed' : 'other') as DnsOverviewEvent['kind'],
        title: `${kind} ${e.involvedObject.name}: ${e.reason || 'Event'}`,
        detail: e.message,
      });
    }

    recent.sort((a, b) => b.when.localeCompare(a.when));
    const recentEvents = recent.slice(0, 15);

    // ---------------- filter options ----------------
    const filters = {
      gateways: [...new Set(rows.map((r) => r.gatewayName).filter(Boolean) as string[])].sort(),
      providers: [...new Set(rows.map((r) => r.providerLabel))].sort(),
      namespaces: [...new Set(rows.map((r) => r.namespace))].sort(),
    };

    return {
      loading,
      rows,
      kpi,
      propagationBuckets,
      providerSlices,
      recentEvents,
      filters,
    };
  }, [dnsPolicies, dnsPoliciesLoaded, dnsRecords, dnsRecordsLoaded, gateways, gwLoaded, events, eventsLoaded]);
}
