import { AnyPolicy, K8sCondition, PolicyAttachment, PolicyKind } from '../types';

/**
 * Determines the effective policy stack for an HTTPRoute after merge/override
 * resolution per Gateway API GEP-713 (Policy Attachment) + GEP-2649 (TargetRefs):
 *
 *   1. Gateway-level overrides (HIGHEST priority — parent's "this is non-negotiable")
 *   2. Route-level overrides
 *   3. Route-level defaults
 *   4. Gateway-level defaults (LOWEST priority — parent's "use this if nothing else does")
 *
 * Earlier versions of this file had Route overrides winning over Gateway overrides.
 * That was wrong by spec: a `Gateway`-attached policy with `overrides` MUST take
 * precedence over the same kind attached to its `HTTPRoute` — the whole point of
 * gateway-level overrides is platform owners enforcing a ceiling that route owners
 * can't bypass. See:
 *   https://gateway-api.sigs.k8s.io/geps/gep-713/#hierarchy-1
 *
 * Override math is **scoped by policy kind**: a `RateLimitPolicy` override only
 * silences other `RateLimitPolicy` entries — it never overrides an `AuthPolicy` or
 * a `DNSPolicy`. That's enforced by `markOverriddenByKind` below. The returned
 * stack mixes kinds in resolution order so the UI can render a single ordered
 * chain (which is what operators want when debugging "what's enforced here?"),
 * while each kind stays correctly resolved against its own peers.
 */
export function computeEffectivePolicies(
  gatewayPolicies: PolicyAttachment[],
  routePolicies: PolicyAttachment[],
): PolicyAttachment[] {
  const result: PolicyAttachment[] = [];
  const overriddenSet = new Set<string>();

  const routeOverrides = routePolicies.filter((p) => hasOverrides(p.policy));
  const gatewayOverrides = gatewayPolicies.filter((p) => hasOverrides(p.policy));
  const routeDefaults = routePolicies.filter((p) => !hasOverrides(p.policy));
  const gatewayDefaults = gatewayPolicies.filter((p) => !hasOverrides(p.policy));

  // 1. Gateway overrides — top of the hierarchy, nothing can override them.
  for (const p of gatewayOverrides) {
    result.push({ ...p, isOverridden: false, isEnforced: isEnforced(p.conditions) });
    // A Gateway override of kind K silences every other policy of kind K
    // attached anywhere below (Route overrides + Route defaults + Gateway defaults).
    markOverriddenByKind(overriddenSet, p.policyKind, routeOverrides);
    markOverriddenByKind(overriddenSet, p.policyKind, routeDefaults);
    markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
  }

  // 2. Route overrides — only get to win if no Gateway override of the same kind.
  for (const p of routeOverrides) {
    const key = policyKey(p);
    const overridden = overriddenSet.has(key);
    result.push({ ...p, isOverridden: overridden, isEnforced: !overridden && isEnforced(p.conditions) });
    if (!overridden) {
      markOverriddenByKind(overriddenSet, p.policyKind, routeDefaults);
      markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
    }
  }

  // 3. Route defaults — only if no override (Gateway or Route) of the same kind.
  for (const p of routeDefaults) {
    const key = policyKey(p);
    const overridden = overriddenSet.has(key);
    result.push({ ...p, isOverridden: overridden, isEnforced: !overridden && isEnforced(p.conditions) });
    if (!overridden) {
      markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
    }
  }

  // 4. Gateway defaults — last resort, anything above of the same kind wins.
  for (const p of gatewayDefaults) {
    const key = policyKey(p);
    const overridden = overriddenSet.has(key);
    result.push({ ...p, isOverridden: overridden, isEnforced: !overridden && isEnforced(p.conditions) });
  }

  return result;
}

function hasOverrides(policy: AnyPolicy): boolean {
  return !!(policy.spec as Record<string, unknown>).overrides;
}

function isEnforced(conditions: K8sCondition[]): boolean {
  const enforced = conditions.find((c) => c.type === 'Enforced');
  if (enforced) return enforced.status === 'True';
  const accepted = conditions.find((c) => c.type === 'Accepted');
  return accepted?.status === 'True' || false;
}

function policyKey(p: PolicyAttachment): string {
  return `${p.policy.metadata?.namespace}/${p.policy.metadata?.name}`;
}

function markOverriddenByKind(
  set: Set<string>,
  kind: PolicyKind,
  candidates: PolicyAttachment[],
): void {
  for (const c of candidates) {
    if (c.policyKind === kind) {
      set.add(policyKey(c));
    }
  }
}

export function getPolicyLevel(policy: AnyPolicy): 'override' | 'default' {
  return hasOverrides(policy) ? 'override' : 'default';
}
