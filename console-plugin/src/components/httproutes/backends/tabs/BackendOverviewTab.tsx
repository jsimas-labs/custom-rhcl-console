import * as React from 'react';
import {
  DescriptionList, DescriptionListGroup, DescriptionListTerm, DescriptionListDescription,
  Label, Title, Divider,
} from '@patternfly/react-core'; // Label / Title / Divider used below
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../../types/httproute';
import { useBackendTraffic } from '../../../../hooks/useBackendTraffic';
import { DedupedBackend } from '../utils/dedupeBackends';

interface Props {
  backend: DedupedBackend;
  route: HTTPRoute | undefined;
}

/**
 * Overview tab content. Two DescriptionLists stacked: backend operational
 * data on top (resolution, port, endpoints, live traffic), Kubernetes
 * Service identity below (service name, namespace, gateway).
 *
 * Mirrors the columns the table shows — same numbers, in a layout that has
 * room for context (the table can't fit every label).
 */
export const BackendOverviewTab: React.FC<Props> = ({ backend, route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { data, loaded: trafficLoaded, metricsAvailable } = useBackendTraffic(
    route?.metadata?.namespace ?? '',
    route?.metadata?.name ?? '',
    backend.namespace,
    backend.name,
  );

  // Service-level fields. Gateway name comes from the route's first parentRef
  // — there's usually one and that's the operationally interesting one.
  const gatewayName = route?.spec?.parentRefs?.[0]?.name ?? '—';
  const gatewayNs   = route?.spec?.parentRefs?.[0]?.namespace ?? '—';

  return (
    <div style={{ padding: 16 }}>
      <Title headingLevel="h4" size="md">{t('Backend')}</Title>
      <DescriptionList isHorizontal isCompact style={{ marginTop: 8 }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Resolution')}</DescriptionListTerm>
          <DescriptionListDescription>
            {backend.resolvedRefs === null ? (
              <Label color="grey" isCompact>{t('No status yet')}</Label>
            ) : backend.resolvedRefs && backend.serviceFound ? (
              <Label color="green" isCompact>{t('Resolved')}</Label>
            ) : (
              <Label color="red" isCompact>{t('Unresolved')}</Label>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Port')}</DescriptionListTerm>
          <DescriptionListDescription
            style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
            {backend.port ?? '—'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Endpoints')}</DescriptionListTerm>
          <DescriptionListDescription
            style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
            {backend.readyEndpoints}/{backend.totalEndpoints}
            {' '}
            {backend.totalEndpoints > 0 && backend.readyEndpoints === 0 && (
              <Label color="red" isCompact>{t('All pods Not Ready')}</Label>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Weight')}</DescriptionListTerm>
          <DescriptionListDescription>
            {backend.weights.length === 1
              ? backend.weights[0]
              : backend.weights.join(', ')}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Traffic (5m)')}</DescriptionListTerm>
          <DescriptionListDescription>
            {!trafficLoaded ? (
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                {t('Loading…')}
              </span>
            ) : !metricsAvailable ? (
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                {t('Metrics unavailable on this cluster')}
              </span>
            ) : data.reqRate !== null ? (
              <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                {data.reqRate.toFixed(2)} req/s
              </span>
            ) : '—'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Error rate (5m)')}</DescriptionListTerm>
          <DescriptionListDescription>
            {!trafficLoaded || !metricsAvailable ? '—'
              : data.errorRate !== null ? (
                <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                  {data.errorRate.toFixed(3)} req/s (5xx)
                </span>
              ) : '—'}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Divider style={{ margin: '16px 0' }} />

      <Title headingLevel="h4" size="md">{t('Service')}</Title>
      <DescriptionList isHorizontal isCompact style={{ marginTop: 8 }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Service name')}</DescriptionListTerm>
          <DescriptionListDescription
            style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
            {backend.name}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
          <DescriptionListDescription
            style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
            {backend.namespace}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Gateway')}</DescriptionListTerm>
          <DescriptionListDescription
            style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
            {gatewayNs !== '—' ? `${gatewayNs}/${gatewayName}` : gatewayName}
          </DescriptionListDescription>
        </DescriptionListGroup>
        {backend.service?.spec?.type && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Service type')}</DescriptionListTerm>
            <DescriptionListDescription>
              {backend.service.spec.type}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {backend.service?.spec?.clusterIP && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Cluster IP')}</DescriptionListTerm>
            <DescriptionListDescription
              style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
              {backend.service.spec.clusterIP}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>

      <Divider style={{ margin: '16px 0' }} />

      <Title headingLevel="h4" size="md">
        {t('Used by {{n}} rule(s) in this HTTPRoute', { n: backend.ruleCount })}
      </Title>
      <DescriptionList isCompact style={{ marginTop: 8 }}>
        {backend.rules.map((r) => (
          <DescriptionListGroup key={`${r.ruleIndex}-${r.label}`}>
            <DescriptionListTerm>{t('Rule #{{i}}', { i: r.ruleIndex + 1 })}</DescriptionListTerm>
            <DescriptionListDescription>
              <span
                style={{
                  fontFamily: 'var(--pf-t--global--font--family--mono)',
                  fontSize: 12,
                }}
              >
                {r.label}
              </span>
              {r.weight !== 1 && (
                <span style={{ marginLeft: 8 }}>
                  <Label color="orange" isCompact>
                    {t('weight {{w}}', { w: r.weight })}
                  </Label>
                </span>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </div>
  );
};
