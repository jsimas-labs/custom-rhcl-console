import { ResolvedBackend } from '../../../../types/backends';
import { HTTPRoute } from '../../../../types/httproute';
import { backendKey } from './backendDerivedStatus';

/**
 * What a single row in the table represents AFTER dedup.
 *
 * `useBackendsStatus` returns one entry per (rule, backendRef) in the
 * route — so if `banking-api-v1` is referenced by 5 different rules,
 * we get 5 entries pointing at the same Service. From an operator's
 * mental model that's noise: it's one Service either way (same pods,
 * same metrics, same readiness).
 *
 * This view collapses by Service identity (namespace + name + port)
 * and keeps a sidecar of "the rules that point here" so the drawer
 * can surface that detail when relevant.
 */
export interface DedupedBackend extends Omit<ResolvedBackend, 'weight'> {
  /** Number of (rule, backendRef) entries that resolved to this Service. */
  ruleCount: number;
  /**
   * Distinct backendRef weights across those entries. Usually `[1]`, but
   * for routes with weighted split (e.g. lb-test 50/50) you'll see
   * `[1, 50]` — the drawer shows this so the operator can spot the
   * non-trivial weighting at a glance.
   */
  weights: number[];
  /**
   * Human-readable summaries of each rule that references this Service.
   * One entry per (rule × backendRef) match — we don't try to merge
   * matches across rules because the *rule* is what carries policies,
   * filters and weights.
   */
  rules: BackendRuleUsage[];
}

export interface BackendRuleUsage {
  /** Index in spec.rules[] — useful for cross-referencing the YAML. */
  ruleIndex: number;
  /**
   * Compact text label, e.g. "GET /api/v1/accounts/summary" or
   * "POST /api/v1/{accounts/reset, transfers}". Format chosen to match
   * the way the operator already reads the HTTPRoute summary tab.
   */
  label: string;
  /** Weight for this specific backendRef entry. */
  weight: number;
}

/**
 * Collapse the per-backendRef list into per-Service rows.
 *
 * Input is the `ResolvedBackend[]` from `useBackendsStatus` — already
 * enriched with Service/EndpointSlice watches, so we don't need to
 * re-fetch anything here. Output is sorted by name for stable rendering
 * (the sort the user picks in the table runs on top of this).
 */
export function dedupeBackends(
  backends: ResolvedBackend[],
  route: HTTPRoute | undefined,
): DedupedBackend[] {
  // Build rule-usage labels keyed by (ns/name:port) so we can attach them
  // back to the deduped backends below. We walk spec.rules[] in the same
  // order the hook flattened them, so indices match.
  const usageByKey = new Map<string, BackendRuleUsage[]>();
  (route?.spec?.rules ?? []).forEach((rule, idx) => {
    const label = describeRuleMatches(rule);
    for (const ref of rule.backendRefs ?? []) {
      const ns = ref.namespace ?? route?.metadata?.namespace ?? '';
      const key = backendKey({ namespace: ns, name: ref.name, port: ref.port });
      const arr = usageByKey.get(key) ?? [];
      arr.push({ ruleIndex: idx, label, weight: ref.weight ?? 1 });
      usageByKey.set(key, arr);
    }
  });

  // Group ResolvedBackend entries by Service identity. We preserve the
  // first occurrence's enrichment fields (service, endpoints, pods, etc.)
  // because the hook already deduped Service watches on the same key —
  // every entry for `banking-api-v1` will have identical readiness data.
  const byKey = new Map<string, DedupedBackend>();
  for (const b of backends) {
    const key = backendKey(b);
    const existing = byKey.get(key);
    if (existing) {
      existing.ruleCount++;
      if (!existing.weights.includes(b.weight)) existing.weights.push(b.weight);
    } else {
      byKey.set(key, {
        name: b.name,
        namespace: b.namespace,
        port: b.port,
        resolvedRefs: b.resolvedRefs,
        serviceFound: b.serviceFound,
        service: b.service,
        readyEndpoints: b.readyEndpoints,
        totalEndpoints: b.totalEndpoints,
        podNames: b.podNames,
        ruleCount: 1,
        weights: [b.weight],
        rules: usageByKey.get(key) ?? [],
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Compact one-line summary of a rule's matches[]. Tries to be readable
 * without being a paragraph: one method+path per match, joined with ", ",
 * truncated at ~3 entries with "+N more" so the table row doesn't blow up.
 *
 * Examples:
 *   "GET /api/v1/accounts/summary"
 *   "POST /api/v1/{accounts/reset, transfers}"
 *   "5 paths · POST chat/completions, completions, embeddings +2 more"
 *   "/ws, /mcp"  (no method match)
 */
function describeRuleMatches(rule: { matches?: Array<{
  path?: { value?: string }; method?: string;
}> }): string {
  const matches = rule.matches ?? [];
  if (matches.length === 0) return '(no match — catches all)';

  const parts = matches.map((m) => {
    const method = m.method ?? '';
    const path   = m.path?.value ?? '/';
    return method ? `${method} ${path}` : path;
  });

  // If all matches share the same method, merge them: "POST /a, /b, /c".
  const methods = new Set(matches.map((m) => m.method ?? ''));
  if (methods.size === 1 && matches.length > 1) {
    const method = matches[0].method ?? '';
    const paths  = matches.map((m) => m.path?.value ?? '/');
    const shown  = paths.slice(0, 3).join(', ');
    const extra  = paths.length > 3 ? ` +${paths.length - 3} more` : '';
    return method ? `${method} ${shown}${extra}` : `${shown}${extra}`;
  }

  // Mixed methods (or all empty) — just join the first few.
  const shown = parts.slice(0, 3).join(', ');
  const extra = parts.length > 3 ? ` +${parts.length - 3} more` : '';
  return `${shown}${extra}`;
}
