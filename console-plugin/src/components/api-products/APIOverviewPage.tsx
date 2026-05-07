import * as React from 'react';
import { useParams, Link } from 'react-router';
import {
  PageSection,
  Title,
  Spinner,
  Bullseye,
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Label,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { APIProductGVK, HTTPRouteGVK } from '../../models';
import { APIProduct, HTTPRoute } from '../../types';
import { hostnameToURL } from '../../utils/hostname';
import PlansCards from './PlansCards';
import APIKeysTable from './APIKeysTable';
import TrafficSummary from './TrafficSummary';

const APIOverviewPage: React.FC = () => {
  const { ns, name } = useParams<{ ns: string; name: string }>();

  const [product, loaded] = useK8sWatchResource<APIProduct>({
    groupVersionKind: APIProductGVK,
    name,
    namespace: ns,
  });

  if (!loaded || !product) {
    return (
      <>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  return (
    <APIOverviewContent product={product} ns={ns || ''} name={name || ''} />
  );
};

/**
 * Inner component rendered only after the APIProduct has loaded.
 * This avoids conditional hook arguments for the HTTPRoute watch.
 */
const APIOverviewContent: React.FC<{
  product: APIProduct;
  ns: string;
  name: string;
}> = ({ product, ns, name }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const targetRef = product.spec?.targetRef;
  const [route] = useK8sWatchResource<HTTPRoute>(
    targetRef?.name
      ? {
          groupVersionKind: HTTPRouteGVK,
          name: targetRef.name,
          namespace: targetRef.namespace || ns,
        }
      : {
          groupVersionKind: HTTPRouteGVK,
          isList: true,
          namespace: ns,
          limit: 0,
        },
  );

  const displayName = product.spec?.displayName || product.metadata?.name || '';
  const description = product.spec?.description || '';
  const version = product.spec?.version || '-';
  const publishStatus = product.spec?.publishStatus || 'Draft';
  const approvalMode = product.spec?.approvalMode || 'automatic';
  const tags = product.spec?.tags || [];
  const docs = product.spec?.documentation;
  const contact = product.spec?.contact;
  const plans = product.status?.discoveredPlans || [];
  const authScheme = product.status?.discoveredAuthScheme;
  const authType = React.useMemo(() => {
    if (!authScheme?.authentication) return undefined;
    for (const identity of Object.values(authScheme.authentication)) {
      if (identity.apiKey) return 'apiKey';
      if (identity.jwt) return 'jwt';
      if (identity.oidc) return 'oidc';
      if (identity.anonymous) return 'anonymous';
    }
    return undefined;
  }, [authScheme]);

  const singleRoute = targetRef?.name ? (route as HTTPRoute) : undefined;
  const hostnames = singleRoute?.spec?.hostnames || [];
  const resolvedAddress =
    product.status?.resolvedAddress ||
    (hostnames.length > 0 ? hostnameToURL(hostnames[0]) : null);

  const acceptedPaths = React.useMemo(() => {
    if (!singleRoute) return [];
    const paths: { method: string; path: string }[] = [];
    for (const rule of singleRoute.spec?.rules || []) {
      for (const match of rule.matches || []) {
        paths.push({
          method: match.method || '*',
          path: match.path?.value || '/',
        });
      }
    }
    if (paths.length === 0) {
      paths.push({ method: '*', path: '/' });
    }
    return paths;
  }, [singleRoute]);

  const routeName = targetRef?.name || '';

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/connectivity-link/api-products">{t('Back to API Products')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{displayName}</BreadcrumbItem>
        </Breadcrumb>
        <Flex style={{ marginTop: 8 }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">{displayName}</Title>
            {description && (
              <p style={{ marginTop: 4, color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                {description}
              </p>
            )}
          </FlexItem>
          <FlexItem>
            <Label color={publishStatus === 'Published' ? 'green' : 'grey'}>
              {t(publishStatus)}
            </Label>
          </FlexItem>
          <FlexItem>
            <span>Version: {version}</span>
          </FlexItem>
        </Flex>
        {tags.length > 0 && (
          <Flex style={{ marginTop: 8 }} spaceItems={{ default: 'spaceItemsSm' }}>
            {tags.map((tag) => (
              <FlexItem key={tag}>
                <Label color="blue" isCompact>{tag}</Label>
              </FlexItem>
            ))}
          </Flex>
        )}
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          <GridItem span={6}>
            <Card>
              <CardTitle>{t('Address')}</CardTitle>
              <CardBody>
                {resolvedAddress ? (
                  <a href={resolvedAddress} target="_blank" rel="noopener noreferrer">
                    {resolvedAddress}
                  </a>
                ) : (
                  '-'
                )}
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <TrafficSummary routeName={routeName} namespace={ns} />
          </GridItem>

          <GridItem span={6}>
            <Card>
              <CardTitle>{t('Accepted paths')}</CardTitle>
              <CardBody>
                <Table aria-label={t('Accepted paths')} variant="compact">
                  <Thead>
                    <Tr>
                      <Th>{t('Method')}</Th>
                      <Th>{t('Path pattern')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {acceptedPaths.map((p, i) => (
                      <Tr key={i}>
                        <Td>
                          <Label isCompact>{p.method}</Label>
                        </Td>
                        <Td><code>{p.path}</code></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card>
              <CardTitle>{t('Authentication')}</CardTitle>
              <CardBody>
                <DescriptionList isHorizontal isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Auth type')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {authType || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Required')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {authScheme?.authentication ? 'Yes' : 'No'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>{t('Plans')}</CardTitle>
              <CardBody>
                <PlansCards plans={plans} />
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <APIKeysTable
              apiProductName={name}
              namespace={ns}
              approvalMode={approvalMode}
            />
          </GridItem>

          <GridItem span={6}>
            <Card>
              <CardTitle>{t('Documentation')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact>
                  {docs?.url && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>URL</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href={docs.url} target="_blank" rel="noopener noreferrer">
                          {docs.url}
                        </a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {docs?.swaggerUI && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Swagger UI</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href={docs.swaggerUI} target="_blank" rel="noopener noreferrer">
                          {docs.swaggerUI}
                        </a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {docs?.gitRepository && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Git</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href={docs.gitRepository} target="_blank" rel="noopener noreferrer">
                          {docs.gitRepository}
                        </a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {!docs?.url && !docs?.swaggerUI && !docs?.gitRepository && '-'}
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card>
              <CardTitle>{t('Contact')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact>
                  {contact?.team && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Team</DescriptionListTerm>
                      <DescriptionListDescription>{contact.team}</DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {contact?.email && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Email</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {contact?.url && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>URL</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href={contact.url} target="_blank" rel="noopener noreferrer">
                          {contact.url}
                        </a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {!contact?.team && !contact?.email && !contact?.url && '-'}
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default APIOverviewPage;
