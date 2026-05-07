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
