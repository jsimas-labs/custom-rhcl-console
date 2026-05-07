import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Divider,
  Title,
  Icon,
} from '@patternfly/react-core';
import { ArrowDownIcon, ArrowRightIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useAttachedPolicies } from '../../hooks/useAttachedPolicies';
import { POLICY_KIND_LABELS } from '../../models';
import { PolicyAttachment } from '../../types';
import { computeEffectivePolicies, getPolicyLevel } from '../../utils/policyMerge';

interface EffectivePolicyStackProps {
  routeName: string;
  routeNamespace: string;
  parentGatewayName: string;
  parentGatewayNamespace: string;
}

export const EffectivePolicyStack: React.FC<EffectivePolicyStackProps> = ({
  routeName,
  routeNamespace,
  parentGatewayName,
  parentGatewayNamespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const {
    policies: routePolicies,
    loaded: routeLoaded,
  } = useAttachedPolicies('HTTPRoute', routeName, routeNamespace);

  const {
    policies: gatewayPolicies,
    loaded: gatewayLoaded,
  } = useAttachedPolicies('Gateway', parentGatewayName, parentGatewayNamespace);

  const loaded = routeLoaded && gatewayLoaded;

  const effectiveStack = React.useMemo(() => {
    if (!loaded) return [];
    return computeEffectivePolicies(gatewayPolicies, routePolicies);
  }, [loaded, gatewayPolicies, routePolicies]);

  if (!loaded) {
    return <Spinner size="lg" />;
  }

  if (effectiveStack.length === 0) {
    return (
      <EmptyState variant="sm" titleText={t('No policies found')} headingLevel="h3">
        <EmptyStateBody>
          {t('No policies affect this HTTPRoute.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Card>
      <CardTitle>{t('Effective policy stack')}</CardTitle>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {effectiveStack.map((pa, idx) => (
            <React.Fragment key={pa.policy.metadata?.uid}>
              {idx > 0 && (
                <FlexItem>
                  <Icon size="md">
                    <ArrowDownIcon />
                  </Icon>
                </FlexItem>
              )}
              <FlexItem>
                <EffectivePolicyCard attachment={pa} />
              </FlexItem>
            </React.Fragment>
          ))}
        </Flex>
        <Divider style={{ marginTop: 16, marginBottom: 16 }} />
        <Title headingLevel="h4">{t('Resolution order')}</Title>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Label color="purple">{t('Route overrides')}</Label>
          </FlexItem>
          <FlexItem><ArrowRightIcon /></FlexItem>
          <FlexItem>
            <Label color="blue">{t('Gateway overrides')}</Label>
          </FlexItem>
          <FlexItem><ArrowRightIcon /></FlexItem>
          <FlexItem>
            <Label color="teal">{t('Route defaults')}</Label>
          </FlexItem>
          <FlexItem><ArrowRightIcon /></FlexItem>
          <FlexItem>
            <Label color="grey">{t('Gateway defaults')}</Label>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

const EffectivePolicyCard: React.FC<{ attachment: PolicyAttachment }> = ({ attachment }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { policy, policyKind, isOverridden, isEnforced } = attachment;
  const name = policy.metadata?.name || '';
  const ns = policy.metadata?.namespace || '';
  const level = getPolicyLevel(policy);
  const isGateway = attachment.targetRef.kind === 'Gateway';

  return (
      <Card isCompact style={{ opacity: isOverridden ? 0.5 : 1 }}>
      <CardBody>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Label color="blue">{POLICY_KIND_LABELS[policyKind] || policyKind}</Label>
          </FlexItem>
          <FlexItem>{ns}/{name}</FlexItem>
          <FlexItem>
            <Label color={isGateway ? 'purple' : 'teal'}>
              {isGateway ? 'Gateway' : 'Route'}
            </Label>
          </FlexItem>
          <FlexItem>
            <Label color={level === 'override' ? 'orange' : 'grey'}>
              {level === 'override' ? t('Override') : t('Default')}
            </Label>
          </FlexItem>
          <FlexItem>
            {isOverridden ? (
              <Label color="orange">{t('Overridden')}</Label>
            ) : isEnforced ? (
              <Label color="green">{t('Enforced')}</Label>
            ) : (
              <Label color="red">{t('Not Enforced')}</Label>
            )}
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};
