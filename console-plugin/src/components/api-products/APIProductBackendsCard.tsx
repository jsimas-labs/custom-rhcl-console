import * as React from 'react';
import {
  Card, CardTitle, CardBody, Spinner, EmptyState, EmptyStateBody, Label, Flex, FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Link } from 'react-router-dom-v5-compat';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../types/httproute';
import { useBackendsStatus } from '../../hooks/useBackendsStatus';
import { dedupeBackends } from '../httproutes/backends/utils/dedupeBackends';
import {
  derivedStatusFor,
  labelColorForStatus,
} from '../httproutes/backends/utils/backendDerivedStatus';

interface Props {
  route: HTTPRoute | undefined;
  routeNamespace: string;
}

/**
 * Backends card for the APIProduct detail page.
 *
 * APIProducts target an HTTPRoute via `spec.targetRef`. The route's
 * `backendRefs[]` resolve to Kubernetes Services that are the actual
 * backends serving traffic for this product. Showing them here closes
 * the loop "I see the product, the plans, the keys, the traffic — *and*
 * the actual workloads behind it".
 *
 * We deliberately reuse the dedupe + derived-status helpers that the
 * HTTPRoute Backends tab uses, so the operator sees the same row count
 * and same health classification in both places. The view here is a
 * compact subset (no Drawer, no Probe, no per-row traffic polling) —
 * for the full operational drill-down, the row name links over to the
 * HTTPRoute detail page where the rich Backends tab lives.
 */
export const APIProductBackendsCard: React.FC<Props> = ({ route, routeNamespace }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { backends, loaded } = useBackendsStatus(route);

  const deduped = React.useMemo(
    () => dedupeBackends(backends, route),
    [backends, route],
  );

  // Counts for the title strip — same maths as BackendsSummary.
  const counts = React.useMemo(() => {
    const acc = { total: deduped.length, ok: 0, warn: 0, bad: 0 };
    for (const b of deduped) {
      const s = derivedStatusFor(b).status;
      if (s === 'ok')      acc.ok++;
      else if (s === 'warn') acc.warn++;
      else acc.bad++;
    }
    return acc;
  }, [deduped]);

  const routeName = route?.metadata?.name || '';
  const detailHref =
    routeName && routeNamespace
      ? `/connectivity-link/httproutes/${routeNamespace}/${routeName}`
      : undefined;

  return (
    <Card>
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>{t('Backends')}</FlexItem>
          {loaded && deduped.length > 0 && (
            <>
              <FlexItem>
                <Label color="blue" isCompact>
                  {t('{{n}} services', { n: counts.total })}
                </Label>
              </FlexItem>
              {counts.bad > 0 && (
                <FlexItem>
                  <Label color="red" isCompact>{t('{{n}} unhealthy', { n: counts.bad })}</Label>
                </FlexItem>
              )}
              {counts.warn > 0 && (
                <FlexItem>
                  <Label color="orange" isCompact>{t('{{n}} warning', { n: counts.warn })}</Label>
                </FlexItem>
              )}
            </>
          )}
          {detailHref && (
            <FlexItem align={{ default: 'alignRight' }}>
              <Link to={detailHref}>{t('Open HTTPRoute →')}</Link>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        {!loaded ? (
          <Spinner size="md" />
        ) : !route ? (
          <EmptyState
            variant="sm"
            titleText={t('No HTTPRoute resolved')}
            headingLevel="h4"
          >
            <EmptyStateBody>
              {t('This APIProduct targets an HTTPRoute that is not visible in this namespace.')}
            </EmptyStateBody>
          </EmptyState>
        ) : deduped.length === 0 ? (
          <EmptyState
            variant="sm"
            titleText={t('No backends')}
            headingLevel="h4"
          >
            <EmptyStateBody>
              {t('The target HTTPRoute does not declare any backendRefs.')}
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Table variant="compact" aria-label={t('Backends')}>
            <Thead>
              <Tr>
                <Th>{t('Service')}</Th>
                <Th>{t('Health')}</Th>
                <Th>{t('Resolution')}</Th>
                <Th>{t('Port')}</Th>
                <Th>{t('Endpoints')}</Th>
                <Th>{t('Rules')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deduped.map((b) => {
                const d = derivedStatusFor(b);
                const epLabel = `${b.readyEndpoints}/${b.totalEndpoints}`;
                const hasNonTrivialWeight = b.weights.some((w) => w !== 1);
                return (
                  <Tr key={`${b.namespace}/${b.name}:${b.port}`}>
                    <Td
                      style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}
                    >
                      {b.name}
                    </Td>
                    <Td>
                      <Label color={labelColorForStatus(d.status)} isCompact>
                        {t(d.statusKey)}
                      </Label>
                    </Td>
                    <Td>
                      {b.resolvedRefs && b.serviceFound ? (
                        <Label color="green" isCompact>{t('Resolved')}</Label>
                      ) : (
                        <Label color="red" isCompact>{t('Unresolved')}</Label>
                      )}
                    </Td>
                    <Td>{b.port ?? '—'}</Td>
                    <Td>
                      {b.totalEndpoints > 0 && b.readyEndpoints === 0 ? (
                        <Label color="red" isCompact>{epLabel}</Label>
                      ) : (
                        <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>{epLabel}</span>
                      )}
                    </Td>
                    <Td>
                      <Label color={hasNonTrivialWeight ? 'orange' : 'blue'} isCompact>
                        {b.ruleCount}
                        {hasNonTrivialWeight ? ` · ${t('weighted')}` : ''}
                      </Label>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};
