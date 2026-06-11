import * as React from 'react';
// SDK 4.21 federates react-router 5.3; in v5 `Link` lives only in
// `react-router-dom`. Keep this until we move back to SDK 4.22+.
import { Link } from 'react-router-dom';
import { PageSection, Title, Spinner, Bullseye, Label } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import {
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
  POLICY_KIND_LABELS,
  policyResourceURL,
} from '../../models';
import {
  AuthPolicy,
  RateLimitPolicy,
  TokenRateLimitPolicy,
  DNSPolicy,
  TLSPolicy,
  AnyPolicy,
  PolicyKind,
  PolicyTargetReference,
} from '../../types';
import { getWorstConditionSeverity, isConditionTrue } from '../../utils/status';
import { primaryTargetRef } from '../../utils/policyTargets';
import StatusLabel from '../common/StatusLabel';
import FilterToolbar from '../common/FilterToolbar';

interface PolicyRow {
  policy: AnyPolicy;
  policyKind: PolicyKind;
  targetRef: PolicyTargetReference;
}

const PolicyListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedNamespace, setSelectedNamespace] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const [authPolicies, authLoaded] = useK8sWatchResource<AuthPolicy[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
  });
  const [rlPolicies, rlLoaded] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const [trlPolicies, trlLoaded] = useK8sWatchResource<TokenRateLimitPolicy[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
  });
  const [dnsPolicies, dnsLoaded] = useK8sWatchResource<DNSPolicy[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [tlsPolicies, tlsLoaded] = useK8sWatchResource<TLSPolicy[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
  });

  const loaded = authLoaded && rlLoaded && trlLoaded && dnsLoaded && tlsLoaded;

  const allPolicies = React.useMemo((): PolicyRow[] => {
    const rows: PolicyRow[] = [];

    const addRows = (items: AnyPolicy[] | undefined, kind: PolicyKind) => {
      for (const p of items || []) {
        // Handles both spec.targetRefs[] (GEP-2649) and legacy spec.targetRef.
        // Policies without any target ref are skipped (degenerate state).
        const ref = primaryTargetRef(p);
        if (!ref) continue;
        rows.push({ policy: p, policyKind: kind, targetRef: ref });
      }
    };

    addRows(authPolicies, 'AuthPolicy');
    addRows(rlPolicies, 'RateLimitPolicy');
    addRows(trlPolicies, 'TokenRateLimitPolicy');
    addRows(dnsPolicies, 'DNSPolicy');
    addRows(tlsPolicies, 'TLSPolicy');

    return rows;
  }, [authPolicies, rlPolicies, trlPolicies, dnsPolicies, tlsPolicies]);

  const namespaces = React.useMemo(
    () => [...new Set(allPolicies.map((r) => r.policy.metadata?.namespace || ''))].sort(),
    [allPolicies],
  );

  const filtered = React.useMemo(() => {
    let items = allPolicies;

    if (selectedNamespace) {
      items = items.filter((r) => r.policy.metadata?.namespace === selectedNamespace);
    }

    if (searchValue) {
      const lower = searchValue.toLowerCase();
      items = items.filter((r) => {
        const name = (r.policy.metadata?.name || '').toLowerCase();
        const target = r.targetRef.name.toLowerCase();
        return name.includes(lower) || target.includes(lower);
      });
    }

    if (selectedStatuses.length > 0) {
      items = items.filter((r) => {
        const conditions = r.policy.status?.conditions || [];
        return selectedStatuses.some((s) => {
          if (s === 'Accepted') return isConditionTrue(conditions, 'Accepted');
          if (s === 'Enforced') return isConditionTrue(conditions, 'Enforced');
          if (s === 'Overridden') return isConditionTrue(conditions, 'Overridden');
          if (s === 'Failing') {
            const sev = getWorstConditionSeverity(conditions);
            return sev === 'critical' || sev === 'warning';
          }
          return false;
        });
      });
    }

    return items;
  }, [allPolicies, selectedNamespace, searchValue, selectedStatuses]);

  if (!loaded) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Policies')}</Title>
        </PageSection>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1">{t('Policies')}</Title>
      </PageSection>
      <PageSection>
        <FilterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceChange={setSelectedNamespace}
          statusOptions={['Accepted', 'Enforced', 'Overridden', 'Failing']}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
        <Table aria-label={t('Policies')}>
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Policy type')}</Th>
              <Th>{t('Target')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Condition')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((row) => {
              const ns = row.policy.metadata?.namespace || '';
              const name = row.policy.metadata?.name || '';
              const conditions = row.policy.status?.conditions || [];
              const overridden = isConditionTrue(conditions, 'Overridden');

              const targetPath =
                row.targetRef.kind === 'Gateway'
                  ? `/connectivity-link/gateways/${row.targetRef.namespace || ns}/${row.targetRef.name}`
                  : `/connectivity-link/httproutes/${row.targetRef.namespace || ns}/${row.targetRef.name}`;

              return (
                <Tr key={row.policy.metadata?.uid}>
                  <Td>
                    <a href={policyResourceURL(row.policyKind, ns, name)}>{name}</a>
                  </Td>
                  <Td>{ns}</Td>
                  <Td>
                    <Label color="blue">
                      {POLICY_KIND_LABELS[row.policyKind] || row.policyKind}
                    </Label>
                  </Td>
                  <Td>
                    <Link to={targetPath}>
                      {row.targetRef.kind}/{row.targetRef.name}
                    </Link>
                  </Td>
                  <Td>
                    <StatusLabel conditions={conditions} />
                  </Td>
                  <Td>
                    {overridden ? (
                      <Label color="orange">{t('Overridden')}</Label>
                    ) : isConditionTrue(conditions, 'Enforced') ? (
                      <Label color="green">{t('Enforced')}</Label>
                    ) : (
                      <Label color="grey">{t('Accepted')}</Label>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};

export default PolicyListPage;
