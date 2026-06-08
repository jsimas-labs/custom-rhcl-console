import * as React from 'react';

export interface ProbeResult {
  timestamp: number;          // epoch ms
  status: number;             // HTTP code, or 0 for network/timeout
  durationMs: number;         // wall-clock of the call
  path: string;               // path the operator probed
  error?: string;             // populated when status === 0
}

const STORAGE_PREFIX = 'rhcl-console.probeHistory.';
const MAX_HISTORY = 5;

/**
 * Per-backend probe history backed by localStorage.
 *
 * Key shape: `rhcl-console.probeHistory.<routeUid>:<backendNs>/<backendName>`.
 * Uses the route UID instead of `<routeNs>/<routeName>` so a route deleted
 * and recreated under the same name starts a fresh history — the new
 * pod's instance label would otherwise collide visually with the old one.
 *
 * Only the last MAX_HISTORY (5) entries are retained. `record()` rotates
 * in O(1) by trimming the tail; trend logic in the UI is happy with the
 * single most recent transition.
 *
 * localStorage was the right tradeoff for v1:
 *   - Survives a hard page reload but not a logout/clear-data — appropriate
 *     for "did this just work?" rather than auditable history.
 *   - Doesn't add a server-side dependency. The plugin owns no CRD for
 *     probe history, and we'd rather not invent one for this.
 *   - Per-origin scope means each cluster keeps its own history when the
 *     Console URL differs.
 *
 * Defensive against environments where `localStorage` throws (Safari
 * private mode, quota exceeded) — in those cases the hook degrades to
 * memory-only with no warning to the user; their probe still runs.
 */
export function useProbeHistory(
  routeUid: string | undefined,
  backendNs: string,
  backendName: string,
): {
  history: ProbeResult[];
  record: (entry: ProbeResult) => void;
  clear: () => void;
} {
  const key = React.useMemo(
    () => (routeUid ? `${STORAGE_PREFIX}${routeUid}:${backendNs}/${backendName}` : ''),
    [routeUid, backendNs, backendName],
  );

  const [history, setHistory] = React.useState<ProbeResult[]>(() => readKey(key));

  // Re-read on key change. Happens when the operator clicks between cards
  // for different backends without unmounting the parent.
  React.useEffect(() => {
    setHistory(readKey(key));
  }, [key]);

  const record = React.useCallback(
    (entry: ProbeResult) => {
      if (!key) return;
      // Newest first, then truncate to MAX_HISTORY.
      const next = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (_e) {
        // Quota exceeded / Safari private mode. The in-memory copy still
        // works for this tab; just stop persisting.
      }
    },
    [key, history],
  );

  const clear = React.useCallback(() => {
    if (!key) return;
    setHistory([]);
    try {
      window.localStorage.removeItem(key);
    } catch (_e) { /* same fallback as above */ }
  }, [key]);

  return { history, record, clear };
}

function readKey(key: string): ProbeResult[] {
  if (!key) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Light shape check — we tolerate older payloads missing a field but
    // drop anything that's not at least { timestamp, status }.
    return parsed.filter(
      (p): p is ProbeResult =>
        typeof p?.timestamp === 'number' && typeof p?.status === 'number',
    ).slice(0, MAX_HISTORY);
  } catch (_e) {
    return [];
  }
}
