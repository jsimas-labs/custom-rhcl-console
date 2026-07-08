import * as React from 'react';
// SDK 4.21 federates react-router 5.3; in v5 `Link` lives only in
// `react-router-dom`. Keep this until we move back to SDK 4.22+.
import { Link } from 'react-router-dom';
import { PageSection, Title, Spinner, Bullseye, Label, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { GRPCRouteGVK } from '../../models';
import { K8sCondition } from '../../types/common';
import { getWorstConditionSeverity, isConditionTrue } from '../../utils/status';
import StatusLabel from '../common/StatusLabel';
import EmptyRBACState from '../common/EmptyRBACState';
import FilterToolbar from '../common/FilterToolbar';
import ResourceActionsMenu from '../common/ResourceActionsMenu';
import CreateResourceMenu from '../common/CreateResourceMenu';
import '../../styles/plugin-glass.css';

/**
 * GRPCRoute browser (Gateway API v1). Mirrors HTTPRouteListPage — same
 * filter toolbar, same status semantics — with gRPC-specific columns
 * (service/method matches instead of paths). RHCL 1.4.1 surfaces
 * GRPCRoutes in its own console card; this page keeps our plugin at
 * feature parity while linking rows to the native k8s detail view
 * (no dedicated detail page yet — traffic tabs land with a follow-up).
 */
interface GRPCRoute extends K8sResourceCommon {
  spec: {
    hostnames?: string[];
    parentRefs?: { name: string; namespace?: string }[];
    rules?: {
      matches?: { method?: { service?: string; method?: string } }[];
      backendRefs?: { name: string; port?: number }[];
    }[];
  };
  status?: {
    parents?: { conditions?: K8sCondition[] }[];
  };
}

const GRPCRouteListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const { data: routes, loaded, hasAccess } = useResourceWithRBAC<GRPCRoute>(GRPCRouteGVK);

  const namespaces = React.useMemo(
    () => [...new Set((routes || []).map((r) => r.metadata?.namespace || ''))].sort(),
    [routes],
  );

  const filtered = React.useMemo(() => {
    let items = routes || [];
    if (selectedNamespace) {
      items = items.filter((r) => r.metadata?.namespace === selectedNamespace);
    }
    if (searchValue) {
      const lower = searchValue.toLowerCase();
      items = items.filter((r) => {
        const name = (r.metadata?.name || '').toLowerCase();
        const hostnames = r.spec.hostnames || [];
        return name.includes(lower) || hostnames.some((h) => h.toLowerCase().includes(lower));
      });
    }
    if (selectedStatuses.length > 0) {
      items = items.filter((r) => {
        const parentConditions = r.status?.parents?.[0]?.conditions;
        const severity = getWorstConditionSeverity(parentConditions);
        const isAccepted = isConditionTrue(parentConditions, 'Accepted');
        return selectedStatuses.some((s) => {
          if (s === 'Accepted') return isAccepted;
          if (s === 'Healthy') return severity === 'healthy';
          if (s === 'Failing') return severity === 'critical' || severity === 'warning';
          return false;
        });
      });
    }
    return items;
  }, [routes, selectedNamespace, searchValue, selectedStatuses]);

  if (!loaded) {
    return (
      <div className="rhcl-plugin-root">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('GRPCRoutes')}</Title>
        </PageSection>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="rhcl-plugin-root">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('GRPCRoutes')}</Title>
        </PageSection>
        <PageSection>
          <EmptyRBACState resource="grpcroutes" group="gateway.networking.k8s.io" kind="GRPCRoute" />
        </PageSection>
      </div>
    );
  }

  return (
    <div className="rhcl-plugin-root">
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1">{t('GRPCRoutes')}</Title>
          </FlexItem>
          <FlexItem>
            <CreateResourceMenu kinds={['GRPCRoute']} defaultNamespace={selectedNamespace} />
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <FilterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t('Search by name or hostname')}
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceChange={setSelectedNamespace}
          statusOptions={['Accepted', 'Healthy', 'Failing']}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
        <Table aria-label={t('GRPCRoutes')}>
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Hostnames')}</Th>
              <Th>{t('Services (gRPC)')}</Th>
              <Th>{t('Gateway')}</Th>
              <Th>{t('Status')}</Th>
              <Th aria-label={t('Actions')} />
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((r) => {
              const ns = r.metadata?.namespace || '';
              const name = r.metadata?.name || '';
              // Distinct gRPC services referenced across rules — the
              // gRPC analogue of the HTTP path column.
              const services = [
                ...new Set(
                  (r.spec.rules || [])
                    .flatMap((rule) => rule.matches || [])
                    .map((m) => m.method?.service)
                    .filter(Boolean) as string[],
                ),
              ];
              const parent = r.spec.parentRefs?.[0];
              return (
                <Tr key={r.metadata?.uid}>
                  <Td>
                    {/* No plugin detail page yet — link to the native
                        resource view so the row still lands somewhere
                        useful. */}
                    <Link to={`/k8s/ns/${ns}/gateway.networking.k8s.io~v1~GRPCRoute/${name}`}>
                      {name}
                    </Link>
                  </Td>
                  <Td>{ns}</Td>
                  <Td>{(r.spec.hostnames || []).join(', ') || '—'}</Td>
                  <Td>
                    {services.length === 0
                      ? t('All services')
                      : services.map((s) => (
                          <Label key={s} isCompact color="purple" style={{ marginRight: 4 }}>
                            {s}
                          </Label>
                        ))}
                  </Td>
                  <Td>
                    {parent ? (
                      <Link
                        to={`/connectivity-link/gateways/${parent.namespace || ns}/${parent.name}`}
                      >
                        {parent.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td>
                    <StatusLabel conditions={r.status?.parents?.[0]?.conditions} />
                  </Td>
                  <Td isActionCell>
                    <ResourceActionsMenu
                      gvk={GRPCRouteGVK}
                      namespace={ns}
                      name={name}
                      listHref="/connectivity-link/grpcroutes"
                      resource={r}
                      plural="grpcroutes"
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {filtered.length === 0 && (
          <Bullseye style={{ minHeight: 120 }}>
            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
              {t('No GRPCRoutes found. gRPC backends are exposed by creating a GRPCRoute that references the gateway.')}
            </span>
          </Bullseye>
        )}
      </PageSection>
    </div>
  );
};

export default GRPCRouteListPage;
