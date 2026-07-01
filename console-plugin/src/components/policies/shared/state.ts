/**
 * Derive the discrete operational state of a policy from its
 * status.conditions array. This is the source of truth for the colour
 * coding across every PolicyHeader/Status/Troubleshooting card in the
 * shared layout, so a kind-specific page never has to re-implement the
 * "is this healthy?" logic.
 */
import { K8sCondition } from '../../../types';
import { findCondition } from '../../../utils/status';
import { PolicyOperationalState, PolicyResource } from './types';

export interface PolicyStatusSummary {
  state: PolicyOperationalState;
  accepted: boolean;
  enforced: boolean;
  acceptedCondition?: K8sCondition;
  enforcedCondition?: K8sCondition;
  reason: string;
  message: string;
  lastTransitionTime?: string;
  /**
   * Worst-case warning conditions (Failed/Degraded/Error true, or
   * Accepted/Enforced/ResolvedRefs false). Used by the
   * Troubleshooting card to enumerate "what's wrong" in human terms.
   */
  warnings: K8sCondition[];
}

export function summarizePolicyStatus(policy: PolicyResource | undefined): PolicyStatusSummary {
  const conds: K8sCondition[] = (policy?.status?.conditions as K8sCondition[] | undefined) || [];
  const accepted = findCondition(conds, 'Accepted');
  const enforced = findCondition(conds, 'Enforced');

  const acceptedTrue = accepted?.status === 'True';
  const enforcedTrue = enforced?.status === 'True';

  const warnings = conds.filter((c) => {
    const negative = c.type === 'Degraded' || c.type === 'Error' || c.type === 'Failed';
    if (negative && c.status === 'True') return true;
    const positive =
      c.type === 'Accepted' ||
      c.type === 'Enforced' ||
      c.type === 'Ready' ||
      c.type === 'Programmed' ||
      c.type === 'ResolvedRefs';
    if (positive && c.status === 'False') return true;
    return false;
  });

  let state: PolicyOperationalState = 'unknown';
  if (conds.length === 0) state = 'unknown';
  else if (acceptedTrue && enforcedTrue) state = 'healthy';
  else if (warnings.length > 0 || accepted?.status === 'False' || enforced?.status === 'False') state = 'degraded';
  else state = 'progressing';

  // Pick the most informative reason/message — prefer Enforced when present
  // (it's where the controller explains "why partial" / "why overridden"),
  // otherwise fall back to Accepted, then to the first warning.
  const informative = enforced || accepted || warnings[0];

  return {
    state,
    accepted: acceptedTrue,
    enforced: enforcedTrue,
    acceptedCondition: accepted,
    enforcedCondition: enforced,
    reason: informative?.reason || '',
    message: informative?.message || '',
    lastTransitionTime: informative?.lastTransitionTime,
    warnings,
  };
}

/**
 * Diagnostic hints for the Troubleshooting card. The Kuadrant controllers
 * write very condition-rich status, so we can pattern-match a few
 * common dead-ends and surface them as actionable bullets.
 */
export interface PolicyTroubleshootingHint {
  id: string;
  // 1-line label used in the panel.
  label: string;
  // Longer body shown under the label.
  detail?: string;
}

export function policyTroubleshootingHints(
  policy: PolicyResource | undefined,
  summary: PolicyStatusSummary,
): PolicyTroubleshootingHint[] {
  if (!policy) return [];
  if (summary.state === 'healthy') return [];

  const hints: PolicyTroubleshootingHint[] = [];
  const reason = summary.reason.toLowerCase();
  const message = summary.message.toLowerCase();

  if (reason.includes('override') || message.includes('override')) {
    hints.push({
      id: 'overridden',
      label: 'Overridden by a more specific policy',
      detail: 'A Route-level policy attached to the same target supersedes this one. Inspect the effective policy stack on the target.',
    });
  }
  if (reason.includes('targetnotfound') || message.includes('not found') || message.includes('does not exist')) {
    hints.push({
      id: 'target-missing',
      label: 'Target resource not found',
      detail: 'The Gateway or HTTPRoute referenced by this policy could not be located. Verify the targetRef name/namespace.',
    });
  }
  if (!summary.accepted) {
    hints.push({
      id: 'not-accepted',
      label: 'Policy not accepted',
      detail: summary.message || 'The controller has not accepted this policy. Check the operator logs for validation errors.',
    });
  }
  if (summary.accepted && !summary.enforced && hints.length === 0) {
    hints.push({
      id: 'not-enforced',
      label: 'Accepted but not enforced',
      detail: summary.message || 'The policy is valid but no target traffic is being affected. Confirm the target is receiving requests.',
    });
  }
  if (summary.state === 'progressing') {
    hints.push({
      id: 'progressing',
      label: 'Controller reconciliation in progress',
      detail: 'Give the controller a few seconds and refresh.',
    });
  }
  if (hints.length === 0 && summary.warnings.length > 0) {
    hints.push({
      id: 'warning',
      label: summary.warnings[0].reason || 'Policy degraded',
      detail: summary.warnings[0].message || '',
    });
  }
  return hints;
}
