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
  // window='1h' makes the displayed req/s, success% and errors% reflect
  // the LAST HOUR of traffic — matching the card title. Polling every
  // 30 s keeps it close to live without hammering Prometheus.
  const { data, loaded, metricsAvailable } = usePrometheusTraffic(
    'HTTPRoute',
    routeName,
    namespace,
    30000,
    '1h',
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
  // Combined 4xx+5xx as a percentage of total — gives a single, scannable
  // error number that matches the "success" framing. We compute it from
  // the per-class rates we already pull (cheap, no extra Prometheus calls).
  // Shown in red so an unhealthy API jumps out next to success.
  // Why not use `100 - successRate`? Because the two numerators come from
  // independent queries and the denominator (requestRate5m) may have
  // scraped at a slightly different moment — they should sum to ~100%
  // but not exactly. Computing from the same window keeps the math
  // visible and avoids implying false precision.
  const errorRateRaw =
    data.rate4xx !== null && data.rate5xx !== null && data.requestRate5m !== null && data.requestRate5m > 0
      ? ((data.rate4xx + data.rate5xx) / data.requestRate5m) * 100
      : null;
  const errorRate = errorRateRaw !== null ? `${errorRateRaw.toFixed(1)}%` : '-';
  const errorColor =
    errorRateRaw === null
      ? 'var(--pf-t--global--color--nonstatus--gray--default)'
      : errorRateRaw >= 1
        ? 'var(--pf-t--global--color--status--danger--default)'
        : undefined;

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
          <FlexItem>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: errorColor }}>{errorRate}</div>
            <div style={{ fontSize: '0.85em', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>{t('errors (4xx+5xx)')}</div>
          </FlexItem>
        </Flex>
        <TrafficSparkline kind="HTTPRoute" name={routeName} namespace={namespace} />
      </CardBody>
    </Card>
  );
};

export default TrafficSummary;
