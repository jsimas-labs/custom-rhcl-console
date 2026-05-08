import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  EmptyState,
  EmptyStateBody,
  Title,
  Spinner,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useDNSRecordsForGateway } from '../../hooks/useDNSRecordsForGateway';
import StatusLabel from '../common/StatusLabel';

interface DNSHealthCardProps {
  gatewayName: string;
  namespace: string;
}

const DNSHealthCard: React.FC<DNSHealthCardProps> = ({ gatewayName, namespace }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { entries, loaded, error } = useDNSRecordsForGateway(gatewayName, namespace);

  if (!loaded) {
    return (
      <Card>
        <CardTitle>{t('DNS health')}</CardTitle>
        <CardBody><Spinner size="lg" /></CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle>{t('DNS health')}</CardTitle>
        <CardBody>
          <EmptyState variant="sm">
            <Title headingLevel="h3" size="md">
              {t('Error loading DNS records')}
            </Title>
            <EmptyStateBody>{error.message}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardTitle>{t('DNS health')}</CardTitle>
        <CardBody>
          <EmptyState variant="sm">
            <Title headingLevel="h3" size="md">
              {t('No DNS policies')}
            </Title>
            <EmptyStateBody>
              {t('No DNSPolicy is attached to this Gateway.')}
            </EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{t('DNS health')}</CardTitle>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {entries.map((entry) => (
            <FlexItem key={entry.dnsPolicy.metadata?.uid}>
              <Card isCompact>
                <CardBody>
                  <DescriptionList isHorizontal isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>DNSPolicy</DescriptionListTerm>
                      <DescriptionListDescription>
                        {entry.dnsPolicy.metadata?.name}
                        <StatusLabel conditions={entry.dnsPolicy.status?.conditions} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Managed zone')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {entry.managedZone || '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('DNS record status')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {entry.dnsRecords.length} records
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Propagation')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {entry.propagationHealthy ? (
                          <Label color="green" icon={<CheckCircleIcon />}>
                            {t('Healthy')}
                          </Label>
                        ) : (
                          <Label color="red" icon={<ExclamationCircleIcon />}>
                            {t('Degraded')}
                          </Label>
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardBody>
              </Card>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DNSHealthCard;
