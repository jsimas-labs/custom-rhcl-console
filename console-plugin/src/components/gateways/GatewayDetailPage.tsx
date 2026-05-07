import * as React from 'react';
import { useParams, Link } from 'react-router';
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
import { GatewayGVK, HTTPRouteGVK } from '../../models';
import { Gateway, HTTPRoute, K8sCondition } from '../../types';
import { getGatewayExternalHostnames } from '../../utils/hostname';
import StatusLabel from '../common/StatusLabel';
import HostnameCell from '../common/HostnameCell';
import TrafficPanel from '../common/TrafficPanel';
import { PolicyAttachmentView } from '../policies/PolicyAttachmentView';
import TLSHealthCard from '../health/TLSHealthCard';
import DNSHealthCard from '../health/DNSHealthCard';

const GatewayDetailPage: React.FC = () => {
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [activeTab, setActiveTab] = React.useState(0);

  const [gateway, loaded] = useK8sWatchResource<Gateway>({
    groupVersionKind: GatewayGVK,
    name,
    namespace: ns,
  });

  if (!loaded || !gateway) {
    return (
      <>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  const hostnames = getGatewayExternalHostnames(gateway);

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/connectivity-link/gateways">{t('Gateways')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            {ns}/{name}
          </BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" style={{ marginTop: 8 }}>
          {name} <StatusLabel conditions={gateway.status?.conditions} />
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
                        <DescriptionListTerm>{t('Gateway class')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {gateway.spec.gatewayClassName}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Listeners')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {gateway.spec.listeners.length}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Hostnames')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <HostnameCell hostnames={hostnames} asLinks />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={6}>
                <Card>
                  <CardTitle>{t('Listeners')}</CardTitle>
                  <CardBody>
                    <Table aria-label={t('Listeners')} variant="compact">
                      <Thead>
                        <Tr>
                          <Th>{t('Name')}</Th>
                          <Th>Port</Th>
                          <Th>Protocol</Th>
                          <Th>{t('Hostnames')}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {gateway.spec.listeners.map((l) => (
                          <Tr key={l.name}>
                            <Td>{l.name}</Td>
                            <Td>{l.port}</Td>
                            <Td>{l.protocol}</Td>
                            <Td>{l.hostname || '*'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <ConditionsCard conditions={gateway.status?.conditions} />
              </GridItem>
            </Grid>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>{t('Policies')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <PolicyAttachmentView
                targetKind="Gateway"
                targetName={name || ''}
                targetNamespace={ns || ''}
              />
            </div>
          </Tab>

          <Tab eventKey={2} title={<TabTitleText>{t('Routes')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <GatewayRoutesTab gatewayName={name || ''} namespace={ns || ''} />
            </div>
          </Tab>

          <Tab eventKey={3} title={<TabTitleText>{t('Metrics')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <TrafficPanel kind="Gateway" name={name || ''} namespace={ns || ''} />
            </div>
          </Tab>

          <Tab eventKey={4} title={<TabTitleText>{t('TLS health')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <TLSHealthCard gateway={gateway} namespace={ns || ''} />
            </div>
          </Tab>

          <Tab eventKey={5} title={<TabTitleText>{t('DNS health')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <DNSHealthCard gatewayName={name || ''} namespace={ns || ''} />
            </div>
          </Tab>

          <Tab eventKey={6} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
            <div style={{ marginTop: 16 }}>
              <CodeBlock>
                <CodeBlockCode>
                  {yaml.dump(gateway, { noRefs: true, lineWidth: -1 })}
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

const GatewayRoutesTab: React.FC<{ gatewayName: string; namespace: string }> = ({
  gatewayName,
  namespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [routes, loaded] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });

  const filteredRoutes = React.useMemo(() => {
    return (routes || []).filter((r) =>
      r.spec.parentRefs?.some(
        (ref) =>
          ref.name === gatewayName &&
          (!ref.namespace || ref.namespace === namespace),
      ),
    );
  }, [routes, gatewayName, namespace]);

  if (!loaded) {
    return <Spinner size="lg" />;
  }

  return (
    <Table aria-label={t('Routes')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Namespace')}</Th>
          <Th>{t('Hostnames')}</Th>
          <Th>{t('Status')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredRoutes.map((route) => (
          <Tr key={route.metadata?.uid}>
            <Td>
              <Link to={`/connectivity-link/httproutes/${route.metadata?.namespace}/${route.metadata?.name}`}>
                {route.metadata?.name}
              </Link>
            </Td>
            <Td>{route.metadata?.namespace}</Td>
            <Td>{(route.spec.hostnames || []).join(', ') || '-'}</Td>
            <Td>
              <StatusLabel conditions={route.status?.parents?.[0]?.conditions} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default GatewayDetailPage;
