import * as React from 'react';
import { Switch, Tooltip } from '@patternfly/react-core';
import {
  useAccessReview,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { AuthPolicyGVK } from '../../models';
import { isConditionTrue } from '../../utils/status';

interface AuthPolicyEnforcedToggleProps {
  policy: K8sResourceCommon;
  namespace: string;
}

export const AuthPolicyEnforcedToggle: React.FC<AuthPolicyEnforcedToggleProps> = ({
  policy,
  namespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [canUpdate] = useAccessReview({
    group: AuthPolicyGVK.group,
    resource: 'authpolicies',
    verb: 'update',
    namespace,
    name: policy.metadata?.name,
  });

  const policyWithStatus = policy as { status?: { conditions?: { type: string; status: 'True' | 'False' | 'Unknown' }[] } };
  const isEnforced = isConditionTrue(
    policyWithStatus.status?.conditions,
    'Enforced',
  );

  const handleToggle = async () => {
    if (!canUpdate || isUpdating) return;
    setIsUpdating(true);

    try {
      const patchData = [
        {
          op: 'replace',
          path: '/metadata/annotations/kuadrant.io~1enforced',
          value: isEnforced ? 'false' : 'true',
        },
      ];

      await k8sPatch({
        model: {
          apiVersion: `${AuthPolicyGVK.group}/${AuthPolicyGVK.version}`,
          apiGroup: AuthPolicyGVK.group,
          kind: AuthPolicyGVK.kind,
          plural: 'authpolicies',
          abbr: 'AP',
          label: 'AuthPolicy',
          labelPlural: 'AuthPolicies',
          namespaced: true,
        },
        resource: policy,
        data: patchData,
      });
    } catch (e) {
      console.error('Failed to toggle AuthPolicy enforced state:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggle = (
    <Switch
      id={`enforced-toggle-${policy.metadata?.uid}`}
      label={isEnforced ? t('Enforced') : t('Not Enforced')}
      isChecked={isEnforced}
      onChange={handleToggle}
      isDisabled={!canUpdate || isUpdating}
    />
  );

  if (!canUpdate) {
    return (
      <Tooltip content={t('You do not have permission to update this AuthPolicy')}>
        <span>{toggle}</span>
      </Tooltip>
    );
  }

  return toggle;
};
