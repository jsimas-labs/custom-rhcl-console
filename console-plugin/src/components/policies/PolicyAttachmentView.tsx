import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Title,
  Flex,
  FlexItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useAttachedPolicies } from '../../hooks/useAttachedPolicies';
import { POLICY_KIND_LABELS, policyResourceURL } from '../../models';
import { PolicyAttachment } from '../../types';
import { isConditionTrue, getConditionMessage } from '../../utils/status';
import { AuthPolicyEnforcedToggle } from './AuthPolicyEnforcedToggle';

interface PolicyAttachmentViewProps {
  targetKind: string;
  targetName: string;
  targetNamespace: string;
}

export const PolicyAttachmentView: React.FC<PolicyAttachmentViewProps> = ({
  targetKind,
  targetName,
  targetNamespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { policies, loaded, error } = useAttachedPolicies(targetKind, targetName, targetNamespace);

  if (!loaded) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return (
      <EmptyState variant="sm">
        <Title headingLevel="h3" size="md">
          {t('Error loading policies')}
        </Title>
        <EmptyStateBody>{error.message}</EmptyStateBody>
      </EmptyState>
    );
  }

  if (policies.length === 0) {
    return (
      <EmptyState variant="sm">
        <Title headingLevel="h3" size="md">
          {t('No policies found')}
        </Title>
        <EmptyStateBody>
          {t('No policies are attached to this {{kind}}.', { kind: targetKind })}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
      {policies.map((pa) => (
        <FlexItem key={pa.policy.metadata?.uid}>
          <PolicyCard attachment={pa} targetNamespace={targetNamespace} />
        </FlexItem>
      ))}
    </Flex>
  );
};

const PolicyCard: React.FC<{ attachment: PolicyAttachment; targetNamespace: string }> = ({
  attachment,
  targetNamespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { policy, policyKind, conditions, isOverridden, isEnforced } = attachment;
  const name = policy.metadata?.name || '';
  const ns = policy.metadata?.namespace || '';

  const accepted = isConditionTrue(conditions, 'Accepted');
  const enforcedMsg = getConditionMessage(conditions, 'Enforced');
  const overriddenMsg = getConditionMessage(conditions, 'Overridden');

  return (
    <Card isCompact>
      <CardTitle>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Label color="blue">{POLICY_KIND_LABELS[policyKind] || policyKind}</Label>
          </FlexItem>
          <FlexItem>
            <a href={policyResourceURL(policyKind, ns, name)}>{ns}/{name}</a>
          </FlexItem>
          <FlexItem>
            {isOverridden ? (
              <Label color="orange">{t('Overridden')}</Label>
            ) : isEnforced ? (
              <Label color="green">{t('Enforced')}</Label>
            ) : accepted ? (
              <Label color="blue">{t('Accepted')}</Label>
            ) : (
              <Label color="red">{t('Not Enforced')}</Label>
            )}
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Target')}</DescriptionListTerm>
            <DescriptionListDescription>
              {attachment.targetRef.kind}/{attachment.targetRef.name}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {enforcedMsg && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Enforced')}</DescriptionListTerm>
              <DescriptionListDescription>{enforcedMsg}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {overriddenMsg && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Overridden')}</DescriptionListTerm>
              <DescriptionListDescription>{overriddenMsg}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
        {policyKind === 'AuthPolicy' && (
          <div style={{ marginTop: 12 }}>
            <AuthPolicyEnforcedToggle policy={policy} namespace={targetNamespace} />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
