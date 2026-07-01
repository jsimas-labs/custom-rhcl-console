import * as React from 'react';
// SDK 4.21 federates react-router 5.3; in v5 `Link` lives only in
// `react-router-dom`. Keep this until we move back to SDK 4.22+.
import { Link } from 'react-router-dom';
import { PageSection, Title, Spinner, Bullseye } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { useAttachedPolicies } from '../../hooks/useAttachedPolicies';
import { GatewayGVK } from '../../models';
import { Gateway } from '../../types';
import { getGatewayExternalHostnames } from '../../utils/hostname';
import { getWorstConditionSeverity, isConditionTrue } from '../../utils/status';
import StatusLabel from '../common/StatusLabel';
import HostnameCell from '../common/HostnameCell';
import EmptyRBACState from '../common/EmptyRBACState';
import FilterToolbar from '../common/FilterToolbar';
import '../../styles/plugin-glass.css';

const GatewayListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const { data: gateways, loaded, hasAccess } = useResourceWithRBAC<Gateway>(GatewayGVK);

  const namespaces = React.useMemo(
    () => [...new Set((gateways || []).map((gw) => gw.metadata?.namespace || ''))].sort(),
    [gateways],
  );

  const filtered = React.useMemo(() => {
    let items = gateways || [];

    if (selectedNamespace) {
      items = items.filter((gw) => gw.metadata?.namespace === selectedNamespace);
    }

    if (searchValue) {
      const lower = searchValue.toLowerCase();
      items = items.filter((gw) => {
        const name = (gw.metadata?.name || '').toLowerCase();
        const hostnames = getGatewayExternalHostnames(gw);
        return (
          name.includes(lower) ||
          hostnames.some((h) => h.toLowerCase().includes(lower))
        );
      });
    }

    if (selectedStatuses.length > 0) {
      items = items.filter((gw) => {
        const severity = getWorstConditionSeverity(gw.status?.conditions);
        const isProgrammed = isConditionTrue(gw.status?.conditions, 'Programmed');
        return selectedStatuses.some((s) => {
          if (s === 'Programmed') return isProgrammed;
          if (s === 'Healthy') return severity === 'healthy';
          if (s === 'Degraded') return severity === 'warning' || severity === 'critical';
          return false;
        });
      });
    }

    return items;
  }, [gateways, selectedNamespace, searchValue, selectedStatuses]);

  if (!loaded) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Gateways')}</Title>
        </PageSection>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Gateways')}</Title>
        </PageSection>
        <PageSection>
          <EmptyRBACState
            resource={t('Gateways')}
            verb="list"
            group="gateway.networking.k8s.io"
            kind="Gateway"
          />
        </PageSection>
      </>
    );
  }

  return (
    <div className="rhcl-plugin-root">
      <PageSection variant="default">
        <Title headingLevel="h1">{t('Gateways')}</Title>
      </PageSection>
      <PageSection>
        <FilterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceChange={setSelectedNamespace}
          statusOptions={['Programmed', 'Healthy', 'Degraded']}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
        <Table aria-label={t('Gateways')}>
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Gateway class')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Listeners')}</Th>
              <Th>{t('Hostnames')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((gw) => (
              <GatewayRow key={gw.metadata?.uid} gateway={gw} />
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </div>
  );
};

const GatewayRow: React.FC<{ gateway: Gateway }> = ({ gateway }) => {
  const ns = gateway.metadata?.namespace || '';
  const name = gateway.metadata?.name || '';
  const hostnames = getGatewayExternalHostnames(gateway);
  const { policies } = useAttachedPolicies('Gateway', name, ns);

  return (
    <Tr>
      <Td>
        <Link to={`/connectivity-link/gateways/${ns}/${name}`}>{name}</Link>
      </Td>
      <Td>{ns}</Td>
      <Td>{gateway.spec?.gatewayClassName || '-'}</Td>
      <Td>
        <StatusLabel conditions={gateway.status?.conditions} />
        {policies.length > 0 && (
          <span style={{ marginLeft: 8, fontSize: '0.85em', color: 'var(--pf-t--global--color--nonstatus--blue--default)' }}>
            {policies.length} policies
          </span>
        )}
      </Td>
      <Td>{gateway.spec?.listeners?.length ?? 0}</Td>
      <Td><HostnameCell hostnames={hostnames} /></Td>
    </Tr>
  );
};

export default GatewayListPage;
