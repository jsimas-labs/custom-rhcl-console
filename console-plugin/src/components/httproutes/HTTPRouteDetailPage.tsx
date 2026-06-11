import * as React from 'react';
// `useParams` from v5-compat (reads the v6 context populated by the
// host's `<CompatRouter>`); `Link` from v5 `react-router-dom`. See
// GatewayDetailPage for the full reasoning.
import { useParams } from 'react-router-dom-v5-compat';
import { Link } from 'react-router-dom';
import {
  PageSection,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Card,
  CardTitle,
  CardBody,
  Spinner,
  Bullseye,
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Label,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import yaml from 'js-yaml';
import { HTTPRouteGVK } from '../../models';
import { HTTPRoute, K8sCondition } from '../../types';
import { hostnameToURL } from '../../utils/hostname';
import StatusLabel from '../common/StatusLabel';
import TrafficPanel from '../common/TrafficPanel';
import { PolicyAttachmentView } from '../policies/PolicyAttachmentView';
import { EffectivePolicyStack } from '../policies/EffectivePolicyStack';

const HTTPRouteDetailPage: React.FC = () => {
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [activeTab, setActiveTab] = React.useState(0);

  // Same SDK 4.21 quirk: single-resource watch returns undefined forever
  // on this cluster. Listing in the namespace and finding by name works.
  const [routes, loaded] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
    namespace: ns,
  });
  const route = React.useMemo(
    () => (routes || []).find((r) => r.metadata?.name === name),
    [routes, name],
  );

  if (!loaded || !route) {
    return (
      <>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  const hostnames = route.spec?.hostnames || [];
  const parentRef = route.spec?.parentRefs?.[0];
  const parentConditions = route.status?.parents?.[0]?.conditions;

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/connectivity-link/httproutes">{t('HTTPRoutes')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            {ns}/{name}
          </BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" style={{ marginTop: 8 }}>
          {name} <StatusLabel conditions={parentConditions} />
        </Title>
      </PageSection>
      <PageSection>
        <Tabs
          activeKey={activeTab}
          onSelect={(_e, idx) => setActiveTab(idx as number)}
          aria-label={t('Details')}
        >
          <Tab eventKey={0} title={<TabTitleText>{t('Details')}</TabTitleText>}>
            <Grid hasGutter style={{ marginTop: 16 }}>
              <GridItem span={6}>
                <Card>
                  <CardTitle>{t('Details')}</CardTitle>
                  <CardBody>
                    <DescriptionList isHorizontal>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                        <DescriptionListDescription>{name}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
                        <DescriptionListDescription>{ns}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Parent gateway')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {parentRef ? (
                            <Link
                              to={`/connectivity-link/gateways/${parentRef.namespace || ns}/${parentRef.name}`}
                            >
                              {parentRef.name}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Hostnames')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {hostnames.length > 0 ? (
                            hostnames.map((h) => (
                              <div key={h}>
                                <a
                                  href={hostnameToURL(h)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {h}
                                </a>
                              </div>
                            ))
                          ) : (
                            '-'
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={6}>
                <Card>
                  <CardTitle>{t('Backend refs')}</CardTitle>
                  <CardBody>
                    <Table aria-label={t('Backend refs')} variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Rule</Th>
                          <Th>{t('Method')}</Th>
                          <Th>{t('Path pattern')}</Th>
                          <Th>Backend</Th>
                          <Th>Port</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(route.spec?.rules || []).flatMap((rule, ri) =>
                          (rule.backendRefs || []).map((backend, bi) => (
                            <Tr key={`${ri}-${bi}`}>
                              <Td>{ri}</Td>
                              <Td>{rule.matches?.[0]?.method || '*'}</Td>
                              <Td>{rule.matches?.[0]?.path?.value || '/'}</Td>
                              <Td>{backend.name}</Td>
                              <Td>{backend.port || '-'}</Td>
                            </Tr>
                          )),
                        )}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <ConditionsCard conditions={parentConditions} />
              </GridItem>
            </Grid>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>{t('Policies')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <PolicyAttachmentView
                targetKind="HTTPRoute"
                targetName={name || ''}
                targetNamespace={ns || ''}
              />
            </div>
          </Tab>

          <Tab eventKey={2} title={<TabTitleText>{t('Effective policy stack')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <EffectivePolicyStack
                routeName={name || ''}
                routeNamespace={ns || ''}
                parentGatewayName={parentRef?.name || ''}
                parentGatewayNamespace={parentRef?.namespace || ns || ''}
              />
            </div>
          </Tab>

          <Tab eventKey={3} title={<TabTitleText>{t('Metrics')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <TrafficPanel kind="HTTPRoute" name={name || ''} namespace={ns || ''} />
            </div>
          </Tab>

          <Tab eventKey={4} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <CodeBlock>
                <CodeBlockCode>
                  {yaml.dump(route, { noRefs: true, lineWidth: -1 })}
                </CodeBlockCode>
              </CodeBlock>
            </div>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

const ConditionsCard: React.FC<{ conditions?: K8sCondition[] }> = ({ conditions }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  if (!conditions || conditions.length === 0) return null;

  return (
    <Card>
      <CardTitle>{t('Status')}</CardTitle>
      <CardBody>
        <Table aria-label={t('Status')} variant="compact">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>{t('Status')}</Th>
              <Th>Reason</Th>
              <Th>{t('Message')}</Th>
              <Th>Last transition</Th>
            </Tr>
          </Thead>
          <Tbody>
            {conditions.map((c) => (
              <Tr key={c.type}>
                <Td>{c.type}</Td>
                <Td>
                  <Label
                    color={c.status === 'True' ? 'green' : c.status === 'False' ? 'red' : 'grey'}
                  >
                    {c.status}
                  </Label>
                </Td>
                <Td>{c.reason || '-'}</Td>
                <Td>{c.message || '-'}</Td>
                <Td>{c.lastTransitionTime || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default HTTPRouteDetailPage;
