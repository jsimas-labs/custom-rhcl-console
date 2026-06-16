import * as React from 'react';
import {
  Card, CardTitle, CardBody, Title, Grid, GridItem,
  Spinner, EmptyState, EmptyStateBody,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../../types/httproute';
import { useBackendTraffic } from '../../../../hooks/useBackendTraffic';
import { DedupedBackend } from '../utils/dedupeBackends';

interface Props {
  backend: DedupedBackend;
  route: HTTPRoute | undefined;
}

/**
 * Metrics tab — instantaneous numbers for *this* backend (not the route).
 *
 * Why not the full TrafficCharts from the Metrics tab of the parent page:
 *   - Those query at the route level (route_name=…) so they include every
 *     backendRef. Showing them here would mislead — the same chart on
 *     every backend's drawer would look identical.
 *   - The per-backend Prometheus queries live in `useBackendTraffic` and
 *     return three scalars (reqRate, successRate, errorRate). Three big
 *     numbers in a row is the right density for a drawer.
 *
 * If we later add range queries scoped to (route, backend), this is where
 * we'd plug a sparkline in below each number. Punting for now — the row
 * already gives the same numbers at a glance.
 */
export const BackendMetricsTab: React.FC<Props> = ({ backend, route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { data, loaded, metricsAvailable } = useBackendTraffic(
    route?.metadata?.namespace ?? '',
    route?.metadata?.name ?? '',
    backend.namespace,
    backend.name,
  );

  if (!loaded) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spinner size="lg" /></div>;
  }
  if (!metricsAvailable) {
    return (
      <EmptyState variant="sm" titleText={t('Metrics unavailable')} headingLevel="h4">
        <EmptyStateBody>
          {t('Cluster Prometheus is not reachable from the console. Enable User Workload Monitoring to see live traffic.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Compute percentage from successRate (already %), and 5xx percent from
  // the absolute rates. Display formatted to keep the cards short.
  const reqStr  = data.reqRate    !== null ? `${data.reqRate.toFixed(2)}` : '—';
  const succStr = data.successRate !== null ? `${data.successRate.toFixed(2)}%` : '—';
  const errStr  = data.errorRate  !== null ? data.errorRate.toFixed(3)    : '—';

  return (
    <div style={{ padding: 16 }}>
      <Title headingLevel="h4" size="md">{t('Live (last 5 minutes)')}</Title>
      <Grid hasGutter style={{ marginTop: 12 }}>
        <MetricCard
          label={t('Request rate')}
          value={reqStr}
          unit="req/s"
          hint={t('From HTTPRoute → this backend only')}
        />
        <MetricCard
          label={t('Success rate')}
          value={succStr}
          unit=""
          hint={t('Share of 2xx + 3xx responses')}
          accent={
            data.successRate === null ? undefined
            : data.successRate >= 99 ? 'success'
            : data.successRate >= 95 ? 'warning'
            : 'danger'
          }
        />
        <MetricCard
          label={t('Error rate')}
          value={errStr}
          unit="req/s (5xx)"
          hint={t('5xx responses per second')}
          accent={
            data.errorRate === null      ? undefined
            : data.errorRate === 0       ? 'success'
            : data.errorRate < 0.1       ? 'warning'
            : 'danger'
          }
        />
      </Grid>
      <p style={{
        marginTop: 16,
        fontSize: 12,
        color: 'var(--pf-t--global--text--color--subtle)',
      }}>
        {t('Numbers come from cluster Prometheus via istio_requests_total scoped to (route, backend). Refreshed every 60s.')}
      </p>
    </div>
  );
};

const ACCENT_COLORS: Record<string, string> = {
  success: 'var(--pf-t--global--text--color--status--success--default)',
  warning: 'var(--pf-t--global--text--color--status--warning--default)',
  danger:  'var(--pf-t--global--text--color--status--danger--default)',
};

const MetricCard: React.FC<{
  label: string; value: string; unit?: string; hint?: string;
  accent?: 'success' | 'warning' | 'danger';
}> = ({ label, value, unit, hint, accent }) => (
  <GridItem span={4}>
    <Card isCompact isFullHeight>
      <CardTitle style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
        {label}
      </CardTitle>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <Title
            headingLevel="h2" size="2xl"
            style={accent ? { color: ACCENT_COLORS[accent] } : undefined}
          >
            {value}
          </Title>
          {unit && (
            <span style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)' }}>
              {unit}
            </span>
          )}
        </div>
        {hint && (
          <p style={{
            marginTop: 6, fontSize: 11,
            color: 'var(--pf-t--global--text--color--subtle)',
          }}>
            {hint}
          </p>
        )}
      </CardBody>
    </Card>
  </GridItem>
);
