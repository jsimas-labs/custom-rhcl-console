import * as React from 'react';
// SDK 4.21 federates react-router 5.3; in v5 `Link` lives only in
// `react-router-dom`. Keep this until we move back to SDK 4.22+.
import { Link } from 'react-router-dom';
import {
  PageSection,
  Title,
  Spinner,
  Bullseye,
  Label,
  Tooltip,
  Button,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { APIProductGVK } from '../../models';
import { APIProduct } from '../../types';
import EmptyRBACState from '../common/EmptyRBACState';
import FilterToolbar from '../common/FilterToolbar';
import ResourceActionsMenu from '../common/ResourceActionsMenu';
import APIProductCascadeDelete from './APIProductCascadeDelete';
import '../../styles/plugin-glass.css';

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

  // Keep `.rhcl-plugin-root` on all early returns so the loading and
  // RBAC-denied states stay on the plugin's dark-gray surface instead
  // of flashing the Console's black background.
  if (!loaded) {
    return (
      <div className="rhcl-plugin-root">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('API Products')}</Title>
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
      </div>
    );
  }

  return (
    <div className="rhcl-plugin-root">
      <PageSection variant="default">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title headingLevel="h1">{t('API Products')}</Title>
          {/* Primary outcome-oriented CTA — the guided wizard is the
              default path; per-resource creation stays available on
              each resource's own list page for advanced users. */}
          <Link to="/connectivity-link/create-api">
            <Button variant="primary" icon={<PlusCircleIcon />}>
              {t('Create API')}
            </Button>
          </Link>
        </div>
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
              <Th aria-label={t('Actions')} />
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((product) => {
              const ns = product.metadata?.namespace || '';
              const name = product.metadata?.name || '';
              const displayName = product.spec?.displayName || name;
              const tags = product.spec?.tags || [];

              return (
                <Tr key={product.metadata?.uid}>
                  <Td>
                    <Link to={`/connectivity-link/api-products/${ns}/${name}`}>
                      {displayName}
                    </Link>
                  </Td>
                  <Td>{product.spec?.version || '-'}</Td>
                  <Td>
                    <Label color={product.spec?.publishStatus === 'Published' ? 'green' : 'grey'}>
                      {t(product.spec?.publishStatus || 'Draft')}
                    </Label>
                  </Td>
                  <Td>{product.spec?.approvalMode || 'automatic'}</Td>
                  <Td>
                    {tags.length > 0 ? (
                      <Tooltip content={tags.join(', ')}>
                        <Label color="blue">{tags.length} {t('Tags').toLowerCase()}</Label>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td isActionCell>
                    <ResourceActionsMenu
                      gvk={APIProductGVK}
                      namespace={ns}
                      name={name}
                      listHref="/connectivity-link/api-products"
                      displayName={displayName}
                      topItems={
                        <APIProductCascadeDelete namespace={ns} name={name} />
                      }
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

export default APIProductListPage;
