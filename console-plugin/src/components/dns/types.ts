/**
 * DNS troubleshooting model — the flow the page renders as a horizontal
 * pipeline. Every step ties back to a Kubernetes object (or a synthesised
 * derivation on top of one, in the case of "Public DNS"), so the visual
 * status colour and the diagnosis panel's copy come from the same
 * source of truth.
 *
 * We keep the model deliberately narrow: seven steps, one status enum,
 * a small `details` bag per step. Anything richer (raw CR conditions,
 * events, YAML) lives behind the "Advanced" section — the goal is
 * "understand the failure in <30s without reading Kubernetes YAML."
 */

export type StepId =
  | 'hostname'
  | 'dnspolicy'
  | 'gateway'
  | 'provider'
  | 'public-dns'
  | 'httproute'
  | 'backend';

/**
 * Ordered as the flow renders left-to-right. Kept as a tuple (not a
 * plain string array) so callers get exhaustive-check coverage when
 * mapping over it.
 */
export const STEP_ORDER: readonly StepId[] = [
  'hostname',
  'dnspolicy',
  'gateway',
  'provider',
  'public-dns',
  'httproute',
  'backend',
] as const;

export type StepStatus =
  | 'healthy'
  | 'pending'
  | 'warning'
  | 'failing'
  | 'skipped'
  | 'not-configured'
  | 'unknown';

/** Fixed catalogue of colours mapped to each status. The map is
 *  authoritative — the CSS + badge component + step card all read from
 *  it, so a colour change here propagates without editing multiple
 *  files. */
export const STATUS_META: Record<
  StepStatus,
  { label: string; color: string; icon: string }
> = {
  healthy: { label: 'Healthy', color: 'var(--pf-t--global--color--status--success--default)', icon: 'check' },
  pending: { label: 'Pending', color: 'var(--pf-t--global--color--status--warning--default)', icon: 'clock' },
  warning: { label: 'Warning', color: 'var(--pf-t--global--color--status--warning--default)', icon: 'exclamation' },
  failing: { label: 'Failing', color: 'var(--pf-t--global--color--status--danger--default)', icon: 'x' },
  skipped: { label: 'Skipped', color: 'var(--pf-t--global--color--nonstatus--gray--default)', icon: 'minus' },
  'not-configured': { label: 'Not configured', color: 'var(--pf-t--global--color--nonstatus--gray--default)', icon: 'question' },
  unknown: { label: 'Unknown', color: 'var(--pf-t--global--color--nonstatus--gray--default)', icon: 'question' },
};

export interface DnsStep {
  id: StepId;
  /** Human title shown on the card. */
  title: string;
  /** Optional resource name shown under the title (e.g. `banking-api.example.com`). */
  resourceName?: string;
  /** Optional namespace shown as a dim chip below the resource name. */
  namespace?: string;
  /** Current computed status. */
  status: StepStatus;
  /** Short human description shown inside the card. */
  summary: string;
  /**
   * `key: value` rows the step card renders when expanded. Order-
   * preserving map; keep it small (≤6 rows) so the card doesn't grow
   * taller than the flow row.
   */
  details: Array<{ label: string; value: string; muted?: boolean }>;
  /** Optional in-cluster URL the "View details" chevron routes to. */
  href?: string;
}

/** Reconciliation event as the page renders it — kept independent from
 *  the raw k8s Event shape so the timeline component doesn't have to
 *  know about `involvedObject`/`lastTimestamp`/etc. */
export interface DnsTimelineEvent {
  when: string; // ISO
  title: string;
  detail?: string;
  status: StepStatus;
}

/** One row on the checks table. Same 10-11 canonical checks
 *  everywhere; derived from the current flow snapshot. */
export interface DnsCheck {
  id: string;
  label: string;
  status: StepStatus;
  details?: string;
  durationMs?: number;
}

/** One row on the resolver table (bottom of the page). */
export interface DnsResolver {
  name: string;
  location: string;
  ip: string;
  status: StepStatus;
  result: string;
  latencyMs?: number;
  lastCheckedIso?: string;
}

/** Top-level snapshot the page renders from. Assembled by
 *  `useDnsTroubleshooting`. */
export interface DnsFlow {
  hostname: string;
  hostnameOptions: string[];
  overallStatus: StepStatus;
  steps: DnsStep[];
  events: DnsTimelineEvent[];
  checks: DnsCheck[];
  /** True while any of the underlying K8s watches is still hydrating. */
  loading: boolean;
  /** The step that most likely explains the current failure — Diagnosis
   *  panel reads from this. Null when everything is healthy or nothing
   *  is configured yet. */
  primaryFailure: DnsStep | null;
  /**
   * True when the cluster has at least one Gateway advertising a
   * hostname but no DNSPolicy claims it. The page renders an
   * empty-state CTA in that case — the flow itself isn't broken,
   * there's just nothing to troubleshoot until the operator creates a
   * DNSPolicy.
   */
  needsDnsPolicy: boolean;
  /** The Gateway that needs a DNSPolicy — surfaced so the empty-state
   *  CTA can pre-fill `targetRef.name` on the Create modal. */
  targetGateway: { name: string; namespace: string } | null;
  /** Raw pipeline CRs — Advanced section reads status.conditions[]
   *  off these. Kept as untyped objects so the Advanced component
   *  doesn't need to grow its own CR type imports. */
  rawObjects: Array<{
    kind: string;
    group?: string;
    version: string;
    name?: string;
    namespace?: string;
    conditions?: Array<{
      type?: string;
      status?: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>;
  }>;
}
