import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../types/httproute';
import { useBackendsStatus } from '../../hooks/useBackendsStatus';
import { BackendStatusCard } from './BackendStatusCard';

interface BackendsTabProps {
  route: HTTPRoute | undefined;
}

/**
 * "Backends" tab for the HTTPRoute detail page.
 *
 * Renders one card per (rule, backendRef) pair and — when the route fans
 * out to N>1 backends — a small rollup summary above the list so the
 * operator gets a single-glance read before scanning individual backends.
 *
 * The default probe path is taken from the route's first match path; if
 * the route has multiple rules with different paths, the operator can
 * change it per-card in the probe form.
 */
export const BackendsTab: React.FC<BackendsTabProps> = ({ route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { backends, loaded } = useBackendsStatus(route);

  // Default path: walk rules in order, take the first matches[].path.value.
  // Falls back to "/" if the route only uses host-only matching.
  const defaultPath = React.useMemo(() => {
    for (const rule of route?.spec?.rules || []) {
      for (const m of rule.matches || []) {
        if (m.path?.value) return m.path.value;
      }
    }
    return '/';
  }, [route]);

  const hostname = route?.spec?.hostnames?.[0] || '';
  const routeUid = route?.metadata?.uid;

  if (!loaded) {
    return <Spinner size="lg" />;
  }

  if (backends.length === 0) {
    return (
      <EmptyState variant="sm" titleText={t('No backends')} headingLevel="h3">
        <EmptyStateBody>
          {t('This HTTPRoute does not declare any backendRefs.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Rollup metrics — only shown when N>1 so single-backend routes stay clean.
  const totalReady = backends.reduce((a, b) => a + b.readyEndpoints, 0);
  const totalEndpoints = backends.reduce((a, b) => a + b.totalEndpoints, 0);
  const allResolved = backends.every((b) => b.resolvedRefs && b.serviceFound);
  const someUnhealthy = backends.some(
    (b) => !b.serviceFound || b.resolvedRefs === false ||
           (b.totalEndpoints > 0 && b.readyEndpoints === 0),
  );

  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
      {backends.length > 1 && (
        <FlexItem>
          <Card isCompact>
            <CardTitle>
              <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Title headingLevel="h4">{t('Backends summary')}</Title>
                </FlexItem>
                <FlexItem>
                  <Label color={someUnhealthy ? 'red' : allResolved ? 'green' : 'orange'}>
                    {t('{{count}} backends', { count: backends.length })}
                  </Label>
                </FlexItem>
                <FlexItem>
                  <Label color={totalReady === totalEndpoints && totalEndpoints > 0 ? 'green' : 'orange'}>
                    {t('{{ready}}/{{total}} pods ready', { ready: totalReady, total: totalEndpoints })}
                  </Label>
                </FlexItem>
                <FlexItem>
                  <Label color={allResolved ? 'green' : 'red'}>
                    {allResolved ? t('All Resolved') : t('Some Unresolved')}
                  </Label>
                </FlexItem>
              </Flex>
            </CardTitle>
            <CardBody>
              <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                {t('Probes hit the backend Service directly through the K8s API server proxy (bypasses gateway). For end-to-end testing through Envoy, use the Copy curl snippet below each card.')}
              </small>
            </CardBody>
          </Card>
        </FlexItem>
      )}
      {backends.map((b, idx) => (
        <FlexItem key={`${b.namespace}/${b.name}-${idx}`}>
          <BackendStatusCard
            backend={b}
            routeName={route?.metadata?.name || ''}
            routeNamespace={route?.metadata?.namespace || ''}
            routeUid={routeUid}
            routeHostname={hostname}
            defaultPath={defaultPath}
          />
        </FlexItem>
      ))}
    </Flex>
  );
};
