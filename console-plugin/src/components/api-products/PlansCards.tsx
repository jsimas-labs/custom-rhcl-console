import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Gallery,
  GalleryItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  EmptyState,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DiscoveredPlan } from '../../types';

interface PlansCardsProps {
  plans: DiscoveredPlan[];
}

const PlansCards: React.FC<PlansCardsProps> = ({ plans }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  if (!plans || plans.length === 0) {
    return (
      <EmptyState variant="sm">
        <Title headingLevel="h4" size="md">
          {t('No plans available')}
        </Title>
        <EmptyStateBody>{t('No subscription plans are configured for this API.')}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Gallery hasGutter minWidths={{ default: '250px' }}>
      {plans.map((plan) => (
        <GalleryItem key={plan.tier}>
          <Card isCompact>
            <CardTitle>{plan.tier}</CardTitle>
            <CardBody>
              <DescriptionList isCompact>
                {plan.limits?.daily !== undefined && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('daily')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {plan.limits.daily.toLocaleString()} requests
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {plan.limits?.weekly !== undefined && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('weekly')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {plan.limits.weekly.toLocaleString()} requests
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {plan.limits?.monthly !== undefined && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('monthly')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {plan.limits.monthly.toLocaleString()} requests
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardBody>
          </Card>
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default PlansCards;
