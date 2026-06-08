import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  Flex,
  FlexItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Divider,
  Tooltip,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ResolvedBackend } from '../../types/backends';
import { RouteSyntheticProbe } from './RouteSyntheticProbe';
import { useBackendTraffic, BackendTrafficData } from '../../hooks/useBackendTraffic';
import type { TFunction } from 'i18next';

interface BackendStatusCardProps {
  backend: ResolvedBackend;
  routeName: string;
  routeNamespace: string;
  routeUid: string | undefined;
  routeHostname: string;
  defaultPath: string;
}

/**
 * Single-backendRef view. Three rows of detail (resolution / readiness /
 * pods) and a probe widget at the bottom. Color of the title label
 * reflects an at-a-glance read of "is this backend healthy" combining
 * `ResolvedRefs` + ready endpoint count.
 */
export const BackendStatusCard: React.FC<BackendStatusCardProps> = ({
  backend, routeName, routeNamespace, routeUid, routeHostname, defaultPath,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { data: traffic, loaded: trafficLoaded, metricsAvailable } = useBackendTraffic(
    routeNamespace,
    routeName,
    backend.namespace,
    backend.name,
  );

  // At-a-glance health: resolved AND at least one ready endpoint.
  // Yellow when resolved but ZERO ready. Red when not resolved or service missing.
  const status: 'ok' | 'warn' | 'bad' =
    !backend.serviceFound || backend.resolvedRefs === false ? 'bad'
    : backend.totalEndpoints > 0 && backend.readyEndpoints === 0 ? 'bad'
    : backend.totalEndpoints === 0 ? 'warn'
    : 'ok';

  const statusColor: 'green' | 'orange' | 'red' =
    status === 'ok' ? 'green' : status === 'warn' ? 'orange' : 'red';
  const statusText: string =
    status === 'ok' ? t('Healthy')
    : status === 'warn' ? t('No endpoints')
    : t('Unhealthy');

  // Endpoints summary: "2/2" or "0/3" so the gap between ready and total is visible.
  const epSummary = `${backend.readyEndpoints}/${backend.totalEndpoints}`;

  // Detect HTTPS Service ports (appProtocol or port name) so the probe
  // can prepend the right scheme on the Service-proxy URL.
  const portObj = backend.service?.spec?.ports?.find((p) => p.port === backend.port);
  const isHttps = portObj?.appProtocol === 'https' || portObj?.name === 'https';

  return (
    <Card>
      <CardTitle>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <span style={{ fontFamily: 'monospace' }}>{backend.namespace}/{backend.name}</span>
          </FlexItem>
          <FlexItem>
            <Label color={statusColor}>{statusText}</Label>
          </FlexItem>
          <FlexItem>
            <Label color="blue" isCompact>{`port ${backend.port ?? '?'}`}</Label>
          </FlexItem>
          {backend.weight !== 1 && (
            <FlexItem>
              <Label color="grey" isCompact>{`weight ${backend.weight}`}</Label>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('K8s resolution')}</DescriptionListTerm>
            <DescriptionListDescription>
              {backend.resolvedRefs === null ? (
                <Label color="grey" isCompact>{t('No status yet')}</Label>
              ) : backend.resolvedRefs ? (
                <Label color="green" isCompact>{t('Resolved')}</Label>
              ) : (
                <Label color="red" isCompact>{t('Unresolved')}</Label>
              )}{' '}
              <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                {backend.serviceFound
                  ? t('(Service found via live watch)')
                  : t('(Service NOT found via live watch)')}
              </small>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Ready endpoints')}</DescriptionListTerm>
            <DescriptionListDescription>
              <span style={{ fontFamily: 'monospace' }}>{epSummary}</span>{' '}
              {backend.totalEndpoints > 0 && backend.readyEndpoints === 0 && (
                <Label color="red" isCompact>{t('All pods Not Ready')}</Label>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              <Tooltip content={t('Real traffic flowing to this backend from this HTTPRoute, last 5 minutes. Read from cluster Prometheus via the Istio request metrics. Updates every 30 s.')}>
                <span>{t('Traffic (5m)')}</span>
              </Tooltip>
            </DescriptionListTerm>
            <DescriptionListDescription>
              {!trafficLoaded ? (
                <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                  {t('Loading…')}
                </small>
              ) : !metricsAvailable ? (
                <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                  {t('Metrics unavailable on this cluster')}
                </small>
              ) : (
                <BackendTrafficStats traffic={traffic} t={t} />
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {backend.podNames.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Pods')}</DescriptionListTerm>
              <DescriptionListDescription>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {backend.podNames.map((p) => (
                    <Label key={p} isCompact variant="outline" style={{ fontFamily: 'monospace' }}>
                      {p}
                    </Label>
                  ))}
                </div>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>

        <Divider style={{ marginTop: 12, marginBottom: 12 }} />

        <RouteSyntheticProbe
          routeUid={routeUid}
          routeHostname={routeHostname}
          backendNamespace={backend.namespace}
          backendName={backend.name}
          backendPort={backend.port ?? 80}
          defaultPath={defaultPath}
          httpsBackend={isHttps}
        />
      </CardBody>
    </Card>
  );
};

// Small inline stats strip for the "Traffic (5m)" row. Three numbers in a
// row so the operator can scan req rate, success%, error rate without a
// chart. Success% colours by threshold (green/orange/red). Error rate is
// always shown — zero is a valid "no errors" signal worth seeing.
const BackendTrafficStats: React.FC<{ traffic: BackendTrafficData; t: TFunction }> = ({ traffic, t }) => {
  const { reqRate, successRate, errorRate } = traffic;
  const reqStr = reqRate !== null ? `${reqRate.toFixed(2)} req/s` : '—';
  const succStr = successRate !== null ? `${successRate.toFixed(1)}%` : '—';
  const errStr = errorRate !== null ? `${errorRate.toFixed(3)} req/s` : '—';
  const succColor: 'green' | 'orange' | 'red' | 'grey' =
    successRate === null ? 'grey'
    : successRate >= 99 ? 'green'
    : successRate >= 95 ? 'orange'
    : 'red';
  const errColor: 'green' | 'orange' | 'red' =
    errorRate === null || errorRate === 0 ? 'green'
    : errorRate < 0.1 ? 'orange'
    : 'red';
  return (
    <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <Tooltip content={t('Request rate to this backend, last 5 minutes')}>
          <Label color="blue" isCompact>{reqStr}</Label>
        </Tooltip>
      </FlexItem>
      <FlexItem>
        <Tooltip content={t('Share of 2xx/3xx responses, last 5 minutes')}>
          <Label color={succColor} isCompact>{t('{{v}} success', { v: succStr })}</Label>
        </Tooltip>
      </FlexItem>
      <FlexItem>
        <Tooltip content={t('5xx error rate, last 5 minutes')}>
          <Label color={errColor} isCompact>{t('{{v}} 5xx', { v: errStr })}</Label>
        </Tooltip>
      </FlexItem>
    </Flex>
  );
};
