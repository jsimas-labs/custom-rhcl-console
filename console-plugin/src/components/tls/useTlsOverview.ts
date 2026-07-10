import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  CertificateGVK,
  GatewayGVK,
  TLSPolicyGVK,
} from '../../models';

/**
 * Data hook for the TLS Overview page. Watches every Certificate,
 * Gateway and TLSPolicy on the cluster (plus recent Events), joins
 * them, and derives:
 *
 *   * one operational row per Certificate — the primary table
 *   * KPI aggregates (health totals, renewal totals, expiring soon,
 *     handshake predictions)
 *   * expiration bucket distribution for the histogram
 *   * issuer distribution for the donut
 *   * recent TLS events (Certificate transitions + related k8s Events)
 *
 * Deliberately does NOT probe HTTPS for every hostname — the operator
 * can drill into TLS Troubleshooting for a real probe. On this page
 * we predict handshake outcome from the pipeline state (cert ready +
 * not expired + gateway programmed → OK).
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

interface CertificateResource extends WithConditions {
  spec?: {
    secretName?: string;
    dnsNames?: string[];
    issuerRef?: { kind?: string; name?: string };
    privateKey?: { algorithm?: string; size?: number };
  };
  status?: {
    conditions?: StatusCondition[];
    notBefore?: string;
    notAfter?: string;
    renewalTime?: string;
  };
}

interface GatewayListener {
  name?: string;
  hostname?: string;
  port?: number;
  protocol?: string;
  tls?: {
    mode?: string;
    certificateRefs?: Array<{ name?: string; namespace?: string; kind?: string }>;
  };
}
interface GatewayResource extends WithConditions {
  spec?: { listeners?: GatewayListener[] };
}

interface TLSPolicyResource extends WithConditions {
  spec?: {
    targetRef?: { kind?: string; name?: string };
    issuerRef?: { kind?: string; name?: string };
  };
}

interface EventLike extends K8sResourceCommon {
  reason?: string;
  message?: string;
  type?: string; // Normal | Warning
  eventTime?: string;
  lastTimestamp?: string;
  firstTimestamp?: string;
  involvedObject?: { kind?: string; name?: string; namespace?: string };
}

export type CertHealthStatus = 'healthy' | 'expiring' | 'expired' | 'error';
export type RenewalStatus = 'scheduled' | 'not-scheduled' | 'failed' | 'unknown';
export type HandshakeStatus = 'ok' | 'failed' | 'unknown';

export interface TlsCertRow {
  id: string;
  hostname: string;
  certificateName: string;
  namespace: string;
  gatewayName?: string;
  gatewayNamespace?: string;
  /** Bucketed issuer label for the donut ("Let's Encrypt Prod",
   *  "Internal CA", "ZeroSSL", "Corporate PKI", "Other"). */
  issuerLabel: string;
  /** Raw issuer name from the Certificate for the tooltip. */
  issuerName?: string;
  status: CertHealthStatus;
  validUntil?: string; // ISO
  daysRemaining: number | null;
  renewal: RenewalStatus;
  renewalTime?: string;
  handshake: HandshakeStatus;
  /** Deep links used by the row-action buttons. */
  href: {
    troubleshooting: string;
    certificate: string;
    gateway?: string;
    /** Console-native YAML editor for the Certificate. */
    yaml: string;
    /** Events tab of the Certificate. */
    events: string;
  };
}

export interface KpiCounts {
  overall: {
    total: number;
    healthy: number;
    expiring: number;
    expired: number;
    error: number;
  };
  renewal: {
    total: number;
    scheduled: number;
    notScheduled: number;
    failed: number;
  };
  expiringSoon: {
    total: number;
    within7: number;
    within30: number;
  };
  handshake: {
    ok: number;
    failed: number;
    unknown: number;
  };
}

export interface ExpirationBucket {
  key: 'expired' | '0-7' | '7-15' | '15-30' | '30-90' | '90+';
  label: string;
  count: number;
  /** Colour bucket for the bar. */
  severity: 'critical' | 'warning' | 'healthy';
}

export interface IssuerSlice {
  label: string;
  count: number;
}

export interface TlsOverviewEvent {
  id: string;
  when: string; // ISO
  kind: 'renewed' | 'expired' | 'renewal-failed' | 'handshake-failed' | 'issued' | 'other';
  title: string;
  detail?: string;
  hostname?: string;
  gatewayName?: string;
  href?: string;
}

export interface TlsOverviewResult {
  loading: boolean;
  rows: TlsCertRow[];
  kpi: KpiCounts;
  expirationBuckets: ExpirationBucket[];
  issuerSlices: IssuerSlice[];
  recentEvents: TlsOverviewEvent[];
  /** Unique values for the toolbar filter dropdowns. */
  filters: {
    gateways: string[];
    issuers: string[];
    namespaces: string[];
  };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function daysUntil(iso: string | undefined | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((t - Date.now()) / 86_400_000);
}

/** Bucket the issuer name into a small handful of well-known
 *  categories so the donut has a stable colour legend across
 *  installs. Anything we don't recognise falls into "Other". */
function bucketIssuer(name?: string): string {
  if (!name) return 'Other';
  const n = name.toLowerCase();
  if (n.includes('letsencrypt-prod')) return "Let's Encrypt Prod";
  if (n.includes('letsencrypt-staging')) return "Let's Encrypt Staging";
  if (n.includes('letsencrypt')) return "Let's Encrypt";
  if (n.includes('zerossl')) return 'ZeroSSL';
  if (n.includes('vault')) return 'Vault PKI';
  if (n.includes('internal') || n.includes('self-signed') || n.includes('ca-issuer'))
    return 'Internal CA';
  if (n.includes('corporate') || n.includes('enterprise')) return 'Corporate PKI';
  return name;
}

function findCondition(conds: StatusCondition[] | undefined, type: string): StatusCondition | undefined {
  return (conds || []).find((c) => c.type === type);
}

/** Classify a Certificate by its Ready + expiry + Issuing conditions. */
function certHealth(
  cert: CertificateResource,
  daysRemaining: number | null,
): CertHealthStatus {
  const ready = findCondition(cert.status?.conditions, 'Ready');
  if (daysRemaining != null && daysRemaining < 0) return 'expired';
  if (!ready) return 'error';
  if (ready.status !== 'True') return 'error';
  if (daysRemaining != null && daysRemaining < 30) return 'expiring';
  return 'healthy';
}

function renewalState(cert: CertificateResource): RenewalStatus {
  const rt = cert.status?.renewalTime;
  const issuing = findCondition(cert.status?.conditions, 'Issuing');
  if (!rt) return 'not-scheduled';
  const t = new Date(rt).getTime();
  if (!Number.isFinite(t)) return 'unknown';
  if (t > Date.now()) return 'scheduled';
  // renewalTime is in the past.
  if (issuing?.status === 'True') return 'scheduled'; // reissuing right now
  return 'failed';
}

/** No live probe here — this is derived. If the cert would validate
 *  and the gateway is programmed, we predict handshake=ok. Anything
 *  else is unknown; failure only comes from an expired cert. */
function predictHandshake(
  cert: CertificateResource,
  gateway: GatewayResource | undefined,
  daysRemaining: number | null,
): HandshakeStatus {
  if (daysRemaining != null && daysRemaining < 0) return 'failed';
  const ready = findCondition(cert.status?.conditions, 'Ready');
  if (!ready || ready.status !== 'True') return 'failed';
  if (!gateway) return 'unknown';
  const gwProgrammed = findCondition(gateway.status?.conditions, 'Programmed');
  if (!gwProgrammed) return 'unknown';
  return gwProgrammed.status === 'True' ? 'ok' : 'failed';
}

/**
 * Best-effort Gateway that "hosts" this Certificate. Two matchers:
 *   1. A listener's certificateRefs[].name equals cert.spec.secretName.
 *   2. A listener's hostname is one of cert.spec.dnsNames.
 */
function gatewayFor(
  cert: CertificateResource,
  gateways: GatewayResource[] | undefined,
): GatewayResource | undefined {
  if (!gateways) return undefined;
  const secretName = cert.spec?.secretName;
  const dnsNames = cert.spec?.dnsNames || [];
  return gateways.find((g) => {
    const listeners = g.spec?.listeners || [];
    if (secretName && listeners.some((l) =>
      (l.tls?.certificateRefs || []).some((r) => r.name === secretName),
    )) {
      return true;
    }
    return listeners.some((l) => {
      if (!l.hostname) return false;
      return dnsNames.some((n) =>
        n === l.hostname ||
        (n.startsWith('*.') && l.hostname!.endsWith(n.slice(1))) ||
        (l.hostname!.startsWith('*.') && n.endsWith(l.hostname!.slice(1))),
      );
    });
  });
}

function bucketOf(daysRemaining: number | null): ExpirationBucket['key'] {
  if (daysRemaining == null) return '90+';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining < 7) return '0-7';
  if (daysRemaining < 15) return '7-15';
  if (daysRemaining < 30) return '15-30';
  if (daysRemaining < 90) return '30-90';
  return '90+';
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

export function useTlsOverview(): TlsOverviewResult {
  const [certificates, certsLoaded] = useK8sWatchResource<CertificateResource[]>({
    groupVersionKind: CertificateGVK,
    isList: true,
  });
  const [gateways, gwLoaded] = useK8sWatchResource<GatewayResource[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });
  const [tlsPolicies, tlsPoliciesLoaded] = useK8sWatchResource<TLSPolicyResource[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
  });
  const [events, eventsLoaded] = useK8sWatchResource<EventLike[]>({
    groupVersionKind: { version: 'v1', kind: 'Event' },
    isList: true,
  });

  return React.useMemo<TlsOverviewResult>(() => {
    const loading = !certsLoaded || !gwLoaded || !tlsPoliciesLoaded || !eventsLoaded;

    // TLSPolicy issuer takes precedence over the Certificate's own
    // issuerRef when a policy targets the gateway that mounts this
    // cert's secret — matches the operator's mental model.
    const policyIssuerByGateway = new Map<string, string | undefined>();
    for (const p of tlsPolicies || []) {
      if (p.spec?.targetRef?.kind !== 'Gateway' || !p.spec.targetRef.name) continue;
      policyIssuerByGateway.set(p.spec.targetRef.name, p.spec.issuerRef?.name);
    }

    // ---------------- rows ----------------
    const rows: TlsCertRow[] = [];
    for (const cert of certificates || []) {
      const dnsNames = cert.spec?.dnsNames || [];
      const hostname = dnsNames[0] || cert.metadata?.name || '';
      const daysRemaining = daysUntil(cert.status?.notAfter);
      const status = certHealth(cert, daysRemaining);
      const renewal = renewalState(cert);
      const gw = gatewayFor(cert, gateways);
      const gatewayName = gw?.metadata?.name;
      const gatewayNamespace = gw?.metadata?.namespace;
      const issuerFromPolicy = gatewayName
        ? policyIssuerByGateway.get(gatewayName)
        : undefined;
      const issuerName = issuerFromPolicy || cert.spec?.issuerRef?.name;
      const handshake = predictHandshake(cert, gw, daysRemaining);

      rows.push({
        id: `${cert.metadata?.namespace}/${cert.metadata?.name}`,
        hostname,
        certificateName: cert.metadata?.name || '',
        namespace: cert.metadata?.namespace || '',
        gatewayName,
        gatewayNamespace,
        issuerLabel: bucketIssuer(issuerName),
        issuerName,
        status,
        validUntil: cert.status?.notAfter,
        daysRemaining,
        renewal,
        renewalTime: cert.status?.renewalTime,
        handshake,
        href: {
          troubleshooting: `/connectivity-link/tls/troubleshooting?hostname=${encodeURIComponent(hostname)}`,
          certificate: `/k8s/ns/${cert.metadata?.namespace}/cert-manager.io~v1~Certificate/${cert.metadata?.name}`,
          gateway: gatewayName
            ? `/connectivity-link/gateways/${gatewayNamespace}/${gatewayName}`
            : undefined,
          yaml: `/k8s/ns/${cert.metadata?.namespace}/cert-manager.io~v1~Certificate/${cert.metadata?.name}/yaml`,
          events: `/k8s/ns/${cert.metadata?.namespace}/cert-manager.io~v1~Certificate/${cert.metadata?.name}/events`,
        },
      });
    }

    // Sort rows: failing first, then by days remaining ascending so
    // the ones about to expire float to the top.
    const statusOrder: Record<CertHealthStatus, number> = {
      error: 0, expired: 1, expiring: 2, healthy: 3,
    };
    rows.sort((a, b) => {
      const ds = statusOrder[a.status] - statusOrder[b.status];
      if (ds !== 0) return ds;
      const da = a.daysRemaining ?? Number.MAX_SAFE_INTEGER;
      const db = b.daysRemaining ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    });

    // ---------------- KPI aggregates ----------------
    const kpi: KpiCounts = {
      overall: { total: rows.length, healthy: 0, expiring: 0, expired: 0, error: 0 },
      renewal: { total: rows.length, scheduled: 0, notScheduled: 0, failed: 0 },
      expiringSoon: { total: 0, within7: 0, within30: 0 },
      handshake: { ok: 0, failed: 0, unknown: 0 },
    };
    for (const r of rows) {
      kpi.overall[r.status]++;
      if (r.renewal === 'scheduled') kpi.renewal.scheduled++;
      else if (r.renewal === 'not-scheduled') kpi.renewal.notScheduled++;
      else if (r.renewal === 'failed') kpi.renewal.failed++;
      if (r.status === 'expiring' && r.daysRemaining != null) {
        kpi.expiringSoon.total++;
        if (r.daysRemaining < 7) kpi.expiringSoon.within7++;
        else kpi.expiringSoon.within30++;
      }
      if (r.handshake === 'ok') kpi.handshake.ok++;
      else if (r.handshake === 'failed') kpi.handshake.failed++;
      else kpi.handshake.unknown++;
    }

    // ---------------- expiration histogram ----------------
    const bucketOrder: ExpirationBucket['key'][] = [
      'expired', '0-7', '7-15', '15-30', '30-90', '90+',
    ];
    const labelFor: Record<ExpirationBucket['key'], string> = {
      expired: 'Expired',
      '0-7': '0-7 days',
      '7-15': '7-15 days',
      '15-30': '15-30 days',
      '30-90': '30-90 days',
      '90+': '> 90 days',
    };
    const severityFor: Record<ExpirationBucket['key'], ExpirationBucket['severity']> = {
      expired: 'critical',
      '0-7': 'critical',
      '7-15': 'warning',
      '15-30': 'warning',
      '30-90': 'healthy',
      '90+': 'healthy',
    };
    const bucketCounts = new Map<ExpirationBucket['key'], number>();
    for (const r of rows) {
      const k = bucketOf(r.daysRemaining);
      bucketCounts.set(k, (bucketCounts.get(k) || 0) + 1);
    }
    const expirationBuckets: ExpirationBucket[] = bucketOrder.map((k) => ({
      key: k,
      label: labelFor[k],
      count: bucketCounts.get(k) || 0,
      severity: severityFor[k],
    }));

    // ---------------- issuer slices ----------------
    const issuerCounts = new Map<string, number>();
    for (const r of rows) {
      issuerCounts.set(r.issuerLabel, (issuerCounts.get(r.issuerLabel) || 0) + 1);
    }
    const issuerSlices: IssuerSlice[] = [...issuerCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // ---------------- recent events ----------------
    // Two sources:
    //   1. Certificate.status.conditions transitions.
    //   2. k8s Events involving a Certificate / CertificateRequest /
    //      Order / Challenge / TLSPolicy that were emitted recently.
    const recent: TlsOverviewEvent[] = [];

    for (const cert of certificates || []) {
      for (const c of cert.status?.conditions || []) {
        if (!c.lastTransitionTime) continue;
        if (c.type !== 'Ready' && c.type !== 'Issuing') continue;
        const rowLike = rows.find(
          (r) =>
            r.certificateName === cert.metadata?.name &&
            r.namespace === cert.metadata?.namespace,
        );
        // Only surface meaningful transitions.
        let kind: TlsOverviewEvent['kind'] = 'other';
        let title = '';
        if (c.type === 'Ready' && c.status === 'True') {
          kind = 'renewed';
          title = `Certificate ${cert.metadata?.name} renewed`;
        } else if (c.type === 'Ready' && c.status === 'False') {
          kind = 'renewal-failed';
          title = `Certificate ${cert.metadata?.name} not ready`;
        } else if (c.type === 'Issuing' && c.status === 'True') {
          kind = 'issued';
          title = `Certificate ${cert.metadata?.name} started issuing`;
        } else {
          continue;
        }
        recent.push({
          id: `${cert.metadata?.namespace}/${cert.metadata?.name}/${c.type}/${c.lastTransitionTime}`,
          when: c.lastTransitionTime,
          kind,
          title,
          detail: c.message || c.reason,
          hostname: rowLike?.hostname,
          gatewayName: rowLike?.gatewayName,
          href: rowLike?.href.troubleshooting,
        });
      }
    }

    for (const e of events || []) {
      if (!e.involvedObject) continue;
      const kind = e.involvedObject.kind;
      if (
        kind !== 'Certificate' &&
        kind !== 'CertificateRequest' &&
        kind !== 'Order' &&
        kind !== 'Challenge' &&
        kind !== 'TLSPolicy'
      ) continue;
      const when = e.lastTimestamp || e.eventTime || e.firstTimestamp;
      if (!when) continue;
      const reason = (e.reason || '').toLowerCase();
      let ekind: TlsOverviewEvent['kind'] = 'other';
      if (reason.includes('issued') || reason.includes('renew')) ekind = 'renewed';
      else if (reason.includes('fail') || reason.includes('error')) ekind = 'renewal-failed';
      else if (reason.includes('expired')) ekind = 'expired';
      recent.push({
        id: `evt-${e.metadata?.namespace}/${e.metadata?.name}`,
        when,
        kind: ekind,
        title: `${kind} ${e.involvedObject.name}: ${e.reason || 'Event'}`,
        detail: e.message,
      });
    }

    recent.sort((a, b) => b.when.localeCompare(a.when));
    const recentEvents = recent.slice(0, 15);

    // ---------------- toolbar filter values ----------------
    const filters = {
      gateways: [...new Set(rows.map((r) => r.gatewayName).filter(Boolean) as string[])].sort(),
      issuers: [...new Set(rows.map((r) => r.issuerLabel))].sort(),
      namespaces: [...new Set(rows.map((r) => r.namespace))].sort(),
    };

    return {
      loading,
      rows,
      kpi,
      expirationBuckets,
      issuerSlices,
      recentEvents,
      filters,
    };
  }, [certificates, certsLoaded, gateways, gwLoaded, tlsPolicies, tlsPoliciesLoaded, events, eventsLoaded]);
}
