import * as React from 'react';
// `useParams` from v5-compat (reads the v6 context populated by the
// host's `<CompatRouter>`); `Link` from v5 `react-router-dom`. See
// GatewayDetailPage for the full reasoning.
import { useParams } from 'react-router-dom-v5-compat';
import { Link } from 'react-router-dom';
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
import { OpenInGrafanaButton } from '../common/OpenInGrafanaButton';
import { OpenInTempoButton } from '../common/OpenInTempoButton';
import { hostnameToURL } from '../../utils/hostname';
import PlansCards from './PlansCards';
import APIKeysTable from './APIKeysTable';
import { APIProductBackendsCard } from './APIProductBackendsCard';
import TrafficSummary from './TrafficSummary';
import TopConsumers from './TopConsumers';

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
  // We previously did a single-resource watch (name + namespace) for the
  // HTTPRoute, but on cluster 4.21 / SDK 4.21 that watch was returning
  // `undefined` indefinitely for some products (the destructure ignored
  // `loaded`/`error`, so the UI silently showed empty Address / Accepted
  // paths / Traffic even when the route existed). Listing in the namespace
  // and filtering client-side is the same pattern GatewayDetailPage uses
  // successfully, costs nothing here (one ns scope, ~tens of routes), and
  // makes the missing-route case explicit (find returns undefined).
  const [routes] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
    namespace: targetRef?.namespace || ns,
  });

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
  // The previous implementation returned the FIRST identity type it iterated
  // and stopped — so an AuthPolicy whose first map key happened to be an
  // anonymous rule (e.g. `ai-mock` for the `/api/ai/*` mock, or
  // `cors-preflight` for OPTIONS) made the card show "anonymous" even
  // though the API actually required apiKey / JWT. The fix: collect every
  // strong type present (apiKey / jwt / oidc), and only fall back to
  // "anonymous" when there is no strong type at all. `Required` then
  // mirrors "has at least one strong type" — anonymous-only really IS
  // a public API, but an API that has CORS preflight alongside apiKey
  // is NOT public.
  const { authType, authRequired } = React.useMemo(() => {
    if (!authScheme?.authentication) {
      return { authType: undefined as string | undefined, authRequired: false };
    }
    const strong = new Set<string>();
    let hasAnonymous = false;
    for (const identity of Object.values(authScheme.authentication)) {
      if (identity.apiKey) strong.add('apiKey');
      if (identity.jwt) strong.add('jwt');
      if (identity.oidc) strong.add('oidc');
      if (identity.anonymous) hasAnonymous = true;
    }
    if (strong.size > 0) {
      // Order labels predictably (apiKey, jwt, oidc) so two calls with the
      // same underlying set always render the same string.
      const ordered = ['apiKey', 'jwt', 'oidc'].filter((t) => strong.has(t));
      return { authType: ordered.join(' / '), authRequired: true };
    }
    if (hasAnonymous) {
      return { authType: 'anonymous', authRequired: false };
    }
    return { authType: undefined, authRequired: false };
  }, [authScheme]);

  const singleRoute = React.useMemo(
    () =>
      targetRef?.name
        ? (routes || []).find((r) => r.metadata?.name === targetRef.name)
        : undefined,
    [routes, targetRef?.name],
  );
  const hostnames = singleRoute?.spec?.hostnames || [];
  const resolvedAddress =
    product.status?.resolvedAddress ||
    (hostnames.length > 0 ? hostnameToURL(hostnames[0]) : null);

  const acceptedPaths = React.useMemo(() => {
    // Even when the route hasn't been found yet (list still loading, or
    // targetRef points at a route that doesn't exist), surface a single
    // catch-all row so the table never renders empty. Previously we
    // returned [] when singleRoute was undefined, which left the table
    // with headers and no body — making it look like the API accepts
    // nothing. The catch-all row matches what Gateway API actually
    // allows when an HTTPRoute has no rule matches.
    const paths: { method: string; path: string }[] = [];
    for (const rule of singleRoute?.spec?.rules || []) {
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
          {/* Deep-link into Grafana, scoped to this API Product's HTTPRoute
              and per-consumer dashboards. The dashboard template var has a
              regex that already strips the trailing `.<rule_idx>` from the
              Istio route_name label, so we send `<ns>.<httproute>` (without
              a `.*` suffix) — that's the exact shape the dropdown lists. */}
          {targetRef?.kind === 'HTTPRoute' && targetRef?.name && (
            <FlexItem>
              <OpenInGrafanaButton
                dashboard="api-overview"
                label={t('Traffic')}
                variant="tertiary"
                vars={{ httproute: `${targetRef.namespace || ns}.${targetRef.name}` }}
              />
            </FlexItem>
          )}
          {targetRef?.kind === 'HTTPRoute' && targetRef?.name && (
            <FlexItem>
              <OpenInGrafanaButton
                dashboard="api-consumers"
                label={t('Consumers')}
                variant="tertiary"
                vars={{ httproute: `${targetRef.namespace || ns}.${targetRef.name}` }}
              />
            </FlexItem>
          )}
          {targetRef?.kind === 'HTTPRoute' && targetRef?.name && (
            <FlexItem>
              {/* Tempo search filtered to the gateway service + http.route
                  tag. From there the trace tree drills into wasm-shim,
                  limitador, and the auto-instrumented banking-api spans. */}
              <OpenInTempoButton
                label={t('Traces')}
                variant="tertiary"
                vars={{
                  serviceName: 'rhcl-gateway',
                  tags: { 'http.route': targetRef.name },
                  lookback: '1h',
                }}
              />
            </FlexItem>
          )}
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
                      {authRequired ? t('Yes') : t('No')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <TopConsumers routeName={routeName} namespace={ns} />
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>{t('Plans')}</CardTitle>
              <CardBody>
                <PlansCards
                  plans={plans}
                  targetRef={targetRef}
                  apiProductNamespace={ns}
                />
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <APIProductBackendsCard
              route={singleRoute}
              routeNamespace={targetRef?.namespace || ns}
            />
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
