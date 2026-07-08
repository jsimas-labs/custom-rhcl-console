import * as React from 'react';
// SDK 4.21 federates react-router 5.3; in v5 `Link` lives only in
// `react-router-dom`. Keep this until we move back to SDK 4.22+.
import { Link } from 'react-router-dom';
import { PageSection, Title, Spinner, Bullseye, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { HTTPRouteGVK } from '../../models';
import { HTTPRoute } from '../../types';
import { getWorstConditionSeverity, isConditionTrue } from '../../utils/status';
import StatusLabel from '../common/StatusLabel';
import HostnameCell from '../common/HostnameCell';
import EmptyRBACState from '../common/EmptyRBACState';
import FilterToolbar from '../common/FilterToolbar';
import ResourceActionsMenu from '../common/ResourceActionsMenu';
import CreateResourceMenu from '../common/CreateResourceMenu';
import '../../styles/plugin-glass.css';

const HTTPRouteListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const { data: httpRoutes, loaded, hasAccess } = useResourceWithRBAC<HTTPRoute>(HTTPRouteGVK);

  const namespaces = React.useMemo(
    () => [...new Set((httpRoutes || []).map((r) => r.metadata?.namespace || ''))].sort(),
    [httpRoutes],
  );

  const filtered = React.useMemo(() => {
    let items = httpRoutes || [];

    if (selectedNamespace) {
      items = items.filter((r) => r.metadata?.namespace === selectedNamespace);
    }

    if (searchValue) {
      const lower = searchValue.toLowerCase();
      items = items.filter((r) => {
        const name = (r.metadata?.name || '').toLowerCase();
        const hostnames = r.spec.hostnames || [];
        return (
          name.includes(lower) ||
          hostnames.some((h) => h.toLowerCase().includes(lower))
        );
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
  }, [httpRoutes, selectedNamespace, searchValue, selectedStatuses]);

  // Every early-return path must keep `.rhcl-plugin-root` on the
  // outermost element too — see GatewayListPage for the full rationale
  // (avoids the black flash while HTTPRoute data loads).
  if (!loaded) {
    return (
      <div className="rhcl-plugin-root">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('HTTPRoutes')}</Title>
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
          <Title headingLevel="h1">{t('HTTPRoutes')}</Title>
        </PageSection>
        <PageSection>
          <EmptyRBACState
            resource={t('HTTPRoutes')}
            verb="list"
            group="gateway.networking.k8s.io"
            kind="HTTPRoute"
          />
        </PageSection>
      </div>
    );
  }

  return (
    <div className="rhcl-plugin-root">
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1">{t('HTTPRoutes')}</Title>
          </FlexItem>
          <FlexItem>
            <CreateResourceMenu kinds={['HTTPRoute']} defaultNamespace={selectedNamespace} />
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <FilterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceChange={setSelectedNamespace}
          statusOptions={['Accepted', 'Healthy', 'Failing']}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
        <Table aria-label={t('HTTPRoutes')}>
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Hostnames')}</Th>
              <Th>{t('Parent gateway')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Backend refs')}</Th>
              <Th aria-label={t('Actions')} />
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((route) => {
              const ns = route.metadata?.namespace || '';
              const name = route.metadata?.name || '';
              const hostnames = route.spec?.hostnames || [];
              const parentRef = route.spec?.parentRefs?.[0];
              const backendCount = (route.spec?.rules || []).reduce(
                (acc, rule) => acc + (rule.backendRefs?.length || 0),
                0,
              );

              return (
                <Tr key={route.metadata?.uid}>
                  <Td>
                    <Link to={`/connectivity-link/httproutes/${ns}/${name}`}>{name}</Link>
                  </Td>
                  <Td>{ns}</Td>
                  <Td><HostnameCell hostnames={hostnames} /></Td>
                  <Td>
                    {parentRef ? (
                      <Link to={`/connectivity-link/gateways/${parentRef.namespace || ns}/${parentRef.name}`}>
                        {parentRef.name}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>
                    <StatusLabel conditions={route.status?.parents?.[0]?.conditions} />
                  </Td>
                  <Td>{backendCount}</Td>
                  <Td isActionCell>
                    <ResourceActionsMenu
                      gvk={HTTPRouteGVK}
                      namespace={ns}
                      name={name}
                      listHref="/connectivity-link/httproutes"
                      resource={route}
                      plural="httproutes"
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </PageSection>
    </div>
  );
};

export default HTTPRouteListPage;
