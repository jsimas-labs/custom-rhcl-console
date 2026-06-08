import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  LabelGroup,
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
import { PolicyAttachment, PolicyKind } from '../../types';
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

  // Kinds present in this stack (insertion-ordered Set), used to render filter
  // chips. We keep the chips OFF unless there are 2+ kinds — single-kind
  // stacks don't need filtering and the chip row would be visual noise.
  const kindsPresent = React.useMemo(() => {
    const seen = new Set<PolicyKind>();
    effectiveStack.forEach((pa) => seen.add(pa.policyKind));
    return Array.from(seen);
  }, [effectiveStack]);

  // null = "all kinds visible"; a kind = "only show this kind". Mixed view is
  // the default because the operator usually wants the whole enforcement chain
  // ordered (Gateway override → Route override → Route default → Gateway default);
  // filtering is for follow-up "let me focus on just RateLimit" deep-dives.
  const [activeKind, setActiveKind] = React.useState<PolicyKind | null>(null);

  const visibleStack = React.useMemo(
    () => (activeKind ? effectiveStack.filter((pa) => pa.policyKind === activeKind) : effectiveStack),
    [effectiveStack, activeKind],
  );

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
        {kindsPresent.length > 1 && (
          <Flex
            spaceItems={{ default: 'spaceItemsSm' }}
            alignItems={{ default: 'alignItemsCenter' }}
            style={{ marginBottom: 16 }}
          >
            <FlexItem>
              <Title headingLevel="h6" size="md">{t('Filter by kind')}</Title>
            </FlexItem>
            <FlexItem>
              <LabelGroup numLabels={kindsPresent.length + 1}>
                <Label
                  color={activeKind === null ? 'blue' : 'grey'}
                  onClick={() => setActiveKind(null)}
                  isCompact
                >
                  {t('All')} ({effectiveStack.length})
                </Label>
                {kindsPresent.map((k) => {
                  const count = effectiveStack.filter((pa) => pa.policyKind === k).length;
                  return (
                    <Label
                      key={k}
                      color={activeKind === k ? 'blue' : 'grey'}
                      onClick={() => setActiveKind(k)}
                      isCompact
                    >
                      {POLICY_KIND_LABELS[k] || k} ({count})
                    </Label>
                  );
                })}
              </LabelGroup>
            </FlexItem>
          </Flex>
        )}
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {visibleStack.map((pa, idx) => (
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
        {/* Order per Gateway API GEP-713: Gateway-attached overrides win first
            (platform owner's ceiling), then Route overrides, then Route
            defaults, then Gateway defaults (parent's fallback). Override math
            is kind-scoped — a RateLimit override does not silence an AuthPolicy. */}
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Label color="blue">{t('Gateway overrides')}</Label>
          </FlexItem>
          <FlexItem><ArrowRightIcon /></FlexItem>
          <FlexItem>
            <Label color="purple">{t('Route overrides')}</Label>
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
