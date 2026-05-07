import { AnyPolicy, K8sCondition, PolicyAttachment, PolicyKind } from '../types';

/**
 * Determines the effective policy stack for an HTTPRoute after merge/override resolution.
 * Kuadrant evaluates policies in this order:
 *   1. Route-level overrides (highest priority)
 *   2. Gateway-level overrides
 *   3. Route-level defaults
 *   4. Gateway-level defaults
 *
 * When a policy uses `overrides`, it takes precedence over `defaults` at the same or
 * lower level. Overridden policies are marked with the `Overridden` condition.
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

  for (const p of routeOverrides) {
    result.push({ ...p, isOverridden: false, isEnforced: isEnforced(p.conditions) });
    markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
    markOverriddenByKind(overriddenSet, p.policyKind, routeDefaults);
    markOverriddenByKind(overriddenSet, p.policyKind, gatewayOverrides);
  }

  for (const p of gatewayOverrides) {
    const key = policyKey(p);
    const overridden = overriddenSet.has(key);
    result.push({ ...p, isOverridden: overridden, isEnforced: !overridden && isEnforced(p.conditions) });
    if (!overridden) {
      markOverriddenByKind(overriddenSet, p.policyKind, routeDefaults);
      markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
    }
  }

  for (const p of routeDefaults) {
    const key = policyKey(p);
    const overridden = overriddenSet.has(key);
    result.push({ ...p, isOverridden: overridden, isEnforced: !overridden && isEnforced(p.conditions) });
    if (!overridden) {
      markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
    }
  }

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
