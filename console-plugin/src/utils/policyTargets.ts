/**
 * Utilities to evaluate Gateway API policy attachment against a target resource.
 *
 * Supports both:
 *   - `spec.targetRefs[]` (plural, current Gateway API per GEP-2649)
 *   - `spec.targetRef`   (singular, legacy form retained for back-compat)
 *
 * A policy "attaches to" a target if ANY entry in its target references matches
 * the (kind, name, namespace) tuple. The reference's `namespace` field is
 * optional: when absent, it defaults to the policy's own namespace per Gateway
 * API semantics.
 */
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { PolicyTargetReference } from '../types/common';

/**
 * Collect every target reference declared by a policy, normalizing the plural
 * `targetRefs[]` and the legacy singular `targetRef` into a single array.
 *
 * Defaults each reference's `namespace` to the policy's own namespace when
 * unspecified, matching the Gateway API resolution rules.
 */
export function policyTargetRefs(policy: K8sResourceCommon): PolicyTargetReference[] {
  const spec = (policy as unknown as { spec?: Record<string, unknown> }).spec || {};
  const policyNs = policy.metadata?.namespace;

  const fromPlural = Array.isArray((spec as { targetRefs?: unknown[] }).targetRefs)
    ? ((spec as { targetRefs: PolicyTargetReference[] }).targetRefs)
    : [];
  const fromSingular = (spec as { targetRef?: PolicyTargetReference }).targetRef
    ? [(spec as { targetRef: PolicyTargetReference }).targetRef]
    : [];

  return [...fromPlural, ...fromSingular].map((ref) => ({
    ...ref,
    namespace: ref.namespace || policyNs,
  }));
}

/**
 * Compare a single policy target reference against the target tuple.
 * Matches when name agrees and (kind, namespace) agree when supplied.
 */
function refMatchesTarget(
  ref: PolicyTargetReference,
  kind: string,
  name: string,
  namespace: string,
): boolean {
  if (ref.name !== name) return false;
  if (ref.kind && ref.kind !== kind) return false;
  if (ref.namespace && ref.namespace !== namespace) return false;
  return true;
}

/**
 * True iff the policy attaches to the given target via ANY of its references
 * (plural or legacy singular). Use this in place of comparing `spec.targetRef`
 * directly so new policies that adopt `targetRefs[]` are picked up.
 */
export function policyAttachesTo(
  policy: K8sResourceCommon,
  targetKind: string,
  targetName: string,
  targetNamespace: string,
): boolean {
  return policyTargetRefs(policy).some((ref) =>
    refMatchesTarget(ref, targetKind, targetName, targetNamespace),
  );
}

/**
 * Primary target reference, used by UI surfaces that need to display one ref
 * per row (the "primary" is the first plural ref, falling back to the legacy
 * singular). Returns undefined if neither shape is present.
 */
export function primaryTargetRef(policy: K8sResourceCommon): PolicyTargetReference | undefined {
  return policyTargetRefs(policy)[0];
}
