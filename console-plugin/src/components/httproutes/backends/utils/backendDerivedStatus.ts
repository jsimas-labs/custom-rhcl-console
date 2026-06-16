/**
 * Derived "is this backend OK right now" — combines the three signals that
 * `useBackendsStatus` exposes (ResolvedRefs from the route status, Service
 * existence from the live watch, ready endpoint count from EndpointSlices).
 *
 * Extracted out of the original BackendStatusCard so the table, the drawer
 * header and the top summary KPIs all share one definition. Drift between
 * them was the bug magnet — three places computing "healthy" three ways.
 *
 * Accepts a structural subtype (the four fields that go into the decision)
 * so both `ResolvedBackend` (per-backendRef view) and `DedupedBackend`
 * (per-Service view) can pass through without a cast — the fields read here
 * are the same in both, by construction.
 */
export type Status = 'ok' | 'warn' | 'bad';

export interface DerivedStatus {
  status: Status;
  /** Human-readable label, in English — i18n key looked up by the caller. */
  statusKey: 'Healthy' | 'No endpoints' | 'No ready endpoints' | 'Unhealthy';
}

export interface BackendForStatus {
  serviceFound: boolean;
  resolvedRefs: boolean | null;
  readyEndpoints: number;
  totalEndpoints: number;
}

export function derivedStatusFor(b: BackendForStatus): DerivedStatus {
  // Service missing OR route says ResolvedRefs=false → hard fail.
  if (!b.serviceFound || b.resolvedRefs === false) {
    return { status: 'bad', statusKey: 'Unhealthy' };
  }
  // Service is there, but every pod is failing readiness → hard fail too.
  if (b.totalEndpoints > 0 && b.readyEndpoints === 0) {
    return { status: 'bad', statusKey: 'No ready endpoints' };
  }
  // Resolved but ZERO endpoints exist. Cluster API agrees the Service is
  // there; nothing is selected by the selector. Plausible (deploy in flight)
  // but operator should know — warn.
  if (b.totalEndpoints === 0) {
    return { status: 'warn', statusKey: 'No endpoints' };
  }
  return { status: 'ok', statusKey: 'Healthy' };
}

/**
 * Maps the abstract status to a PatternFly Label colour. Centralised so the
 * Label palette doesn't get reinvented per-component.
 */
export function labelColorForStatus(s: Status): 'green' | 'orange' | 'red' {
  return s === 'ok' ? 'green' : s === 'warn' ? 'orange' : 'red';
}

/**
 * Stable identity for a backend across renders. The hook returns a fresh
 * array on every poll, so we key by content (ns/name:port) instead of
 * relying on object identity. Two rules pointing at the same Service share
 * the same key on purpose — they ARE the same backend from the operator's
 * perspective; the duplicate rule is a route-shape concern, not a backend
 * concern.
 */
export function backendKey(b: { namespace: string; name: string; port?: number }): string {
  return `${b.namespace}/${b.name}:${b.port ?? ''}`;
}
