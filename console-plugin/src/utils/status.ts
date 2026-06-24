import { K8sCondition, StatusSeverity } from '../types';

export function getWorstConditionSeverity(conditions?: K8sCondition[]): StatusSeverity {
  if (!conditions || conditions.length === 0) return 'unknown';

  let hasFalse = false;
  let hasProgressing = false;
  let hasUnknown = false;

  for (const c of conditions) {
    const isNegativeCondition =
      c.type === 'Degraded' || c.type === 'Error' || c.type === 'Failed';

    if (isNegativeCondition && c.status === 'True') return 'critical';

    const isPositiveCondition =
      c.type === 'Ready' ||
      c.type === 'Programmed' ||
      c.type === 'Accepted' ||
      c.type === 'Enforced' ||
      c.type === 'ResolvedRefs';

    if (isPositiveCondition && c.status === 'False') hasFalse = true;
    if (c.type === 'Progressing' && c.status === 'True') hasProgressing = true;
    if (c.status === 'Unknown') hasUnknown = true;
  }

  if (hasFalse) return 'warning';
  if (hasProgressing) return 'progressing';
  if (hasUnknown) return 'unknown';
  return 'healthy';
}

export function findCondition(
  conditions: K8sCondition[] | undefined,
  type: string,
): K8sCondition | undefined {
  return conditions?.find((c) => c.type === type);
}

export function isConditionTrue(conditions: K8sCondition[] | undefined, type: string): boolean {
  const c = findCondition(conditions, type);
  return c?.status === 'True';
}

export function getConditionMessage(
  conditions: K8sCondition[] | undefined,
  type: string,
): string {
  const c = findCondition(conditions, type);
  return c?.message || '';
}

/**
 * Distinguish between Kuadrant's "fully enforced" and "partially enforced"
 * states. The controller reports both as Enforced=True; the only way to
 * tell them apart is the `message` field. When a Gateway-level policy uses
 * `spec.defaults`, any HTTPRoute attached to the gateway that has its own
 * policy of the same kind overrides the default — so the gateway policy
 * only applies to the routes WITHOUT their own policy, and the controller
 * marks it "partially enforced". (Gateway API GEP-713 defaults semantics.)
 *
 * Returns:
 *   - 'fully'      → "successfully enforced"
 *   - 'partially'  → "partially enforced"
 *   - 'not'        → Enforced=False or no Enforced condition
 */
export type EnforcementState = 'fully' | 'partially' | 'not';

export function getEnforcementState(conditions: K8sCondition[] | undefined): EnforcementState {
  const c = findCondition(conditions, 'Enforced');
  if (!c || c.status !== 'True') return 'not';
  if ((c.message || '').toLowerCase().includes('partial')) return 'partially';
  return 'fully';
}

export function severityToLabelColor(
  severity: StatusSeverity,
): 'green' | 'orange' | 'red' | 'blue' | 'grey' {
  switch (severity) {
    case 'healthy':
      return 'green';
    case 'warning':
      return 'orange';
    case 'critical':
      return 'red';
    case 'progressing':
      return 'blue';
    default:
      return 'grey';
  }
}
