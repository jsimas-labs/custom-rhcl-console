import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Spinner,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { usePrometheusTraffic } from '../../hooks/usePrometheusTraffic';
import { TrafficSparkline } from '../common/TrafficChart';

interface TrafficSummaryProps {
  routeName: string;
  namespace: string;
}

const TrafficSummary: React.FC<TrafficSummaryProps> = ({ routeName, namespace }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { data, loaded, metricsAvailable } = usePrometheusTraffic(
    'HTTPRoute',
    routeName,
    namespace,
    30000,
  );

  if (!loaded) {
    return (
      <Card isCompact>
        <CardTitle>{t('Traffic')} ({t('last hour')})</CardTitle>
        <CardBody><Spinner size="md" /></CardBody>
      </Card>
    );
  }

  if (!metricsAvailable) {
    return (
      <Card isCompact>
        <CardTitle>{t('Traffic')}</CardTitle>
        <CardBody>
          <EmptyState
            variant="xs"
            icon={ExclamationTriangleIcon}
            titleText={t('Metrics unavailable')}
            headingLevel="h4"
          >
            <EmptyStateBody>
              {t('Metrics are unavailable. User workload monitoring may not be enabled on this cluster.')}
            </EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const reqPerSec = data.requestRate5m !== null ? data.requestRate5m.toFixed(2) : '-';
  const successRate = data.successRate !== null ? `${data.successRate.toFixed(1)}%` : '-';

  return (
    <Card isCompact>
      <CardTitle>{t('Traffic')} ({t('last hour')})</CardTitle>
      <CardBody>
        <Flex spaceItems={{ default: 'spaceItemsXl' }}>
          <FlexItem>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{reqPerSec}</div>
            <div style={{ fontSize: '0.85em', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>{t('req/s')}</div>
          </FlexItem>
          <FlexItem>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{successRate}</div>
            <div style={{ fontSize: '0.85em', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>{t('success')}</div>
          </FlexItem>
        </Flex>
        <TrafficSparkline kind="HTTPRoute" name={routeName} namespace={namespace} />
      </CardBody>
    </Card>
  );
};

export default TrafficSummary;
