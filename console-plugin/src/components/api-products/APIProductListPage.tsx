import * as React from 'react';
import { Link } from 'react-router';
import {
  PageSection,
  Title,
  Spinner,
  Bullseye,
  Label,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { APIProductGVK } from '../../models';
import { APIProduct } from '../../types';
import EmptyRBACState from '../common/EmptyRBACState';
import FilterToolbar from '../common/FilterToolbar';

const APIProductListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const {
    data: apiProducts,
    loaded,
    hasAccess,
  } = useResourceWithRBAC<APIProduct>(APIProductGVK);

  const filtered = React.useMemo(() => {
    let items = apiProducts || [];

    if (searchValue) {
      const lower = searchValue.toLowerCase();
      items = items.filter((p) => {
        const displayName = (p.spec.displayName || p.metadata?.name || '').toLowerCase();
        const tags = (p.spec.tags || []).map((t) => t.toLowerCase());
        return (
          displayName.includes(lower) ||
          tags.some((tag) => tag.includes(lower))
        );
      });
    }

    if (selectedStatuses.length > 0) {
      items = items.filter((p) => {
        const status = p.spec.publishStatus || 'Draft';
        return selectedStatuses.includes(status);
      });
    }

    return items;
  }, [apiProducts, searchValue, selectedStatuses]);

  if (!loaded) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('API Products')}</Title>
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
          <Title headingLevel="h1">{t('API Products')}</Title>
        </PageSection>
        <PageSection>
          <EmptyRBACState
            resource={t('API Products')}
            verb="list"
            group="devportal.kuadrant.io"
            kind="APIProduct"
          />
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1">{t('API Products')}</Title>
      </PageSection>
      <PageSection>
        <FilterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t('Search by name or tag')}
          statusOptions={['Published', 'Draft']}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
        <Table aria-label={t('API Products')}>
          <Thead>
            <Tr>
              <Th>{t('Display name')}</Th>
              <Th>{t('Version')}</Th>
              <Th>{t('Publish status')}</Th>
              <Th>{t('Approval mode')}</Th>
              <Th>{t('Tags')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((product) => {
              const ns = product.metadata?.namespace || '';
              const name = product.metadata?.name || '';
              const displayName = product.spec.displayName || name;
              const tags = product.spec.tags || [];

              return (
                <Tr key={product.metadata?.uid}>
                  <Td>
                    <Link to={`/connectivity-link/api-products/${ns}/${name}`}>
                      {displayName}
                    </Link>
                  </Td>
                  <Td>{product.spec.version || '-'}</Td>
                  <Td>
                    <Label color={product.spec.publishStatus === 'Published' ? 'green' : 'grey'}>
                      {t(product.spec.publishStatus || 'Draft')}
                    </Label>
                  </Td>
                  <Td>{product.spec.approvalMode || 'automatic'}</Td>
                  <Td>
                    {tags.length > 0 ? (
                      <Tooltip content={tags.join(', ')}>
                        <Label color="blue">{tags.length} {t('Tags').toLowerCase()}</Label>
                      </Tooltip>
                    ) : (
                      '-'
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

export default APIProductListPage;
