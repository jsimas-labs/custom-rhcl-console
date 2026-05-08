import * as React from 'react';
import '../../plugin.css';
import {
  PageSection,
  Title,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Spinner,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useResourceWithRBAC } from '../../hooks/useResourceWithRBAC';
import { GatewayGVK, HTTPRouteGVK } from '../../models';
import { Gateway, HTTPRoute } from '../../types';
import { getWorstConditionSeverity } from '../../utils/status';
import EmptyRBACState from '../common/EmptyRBACState';
import HostnameSearch from '../common/HostnameSearch';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const {
    data: gateways,
    loaded: gwLoaded,
    hasAccess: gwAccess,
  } = useResourceWithRBAC<Gateway>(GatewayGVK);

  const {
    data: httpRoutes,
    loaded: routeLoaded,
  } = useResourceWithRBAC<HTTPRoute>(HTTPRouteGVK);

  if (!gwLoaded || !routeLoaded) {
    return (
      <>
        <PageSection className="co-m-pane__body">
          <Title headingLevel="h1">{t('Connectivity Link Overview')}</Title>
        </PageSection>
        <PageSection isFilled className="co-m-pane__body">
          <Spinner size="xl" />
        </PageSection>
      </>
    );
  }

  if (!gwAccess) {
    return (
      <>
        <PageSection className="co-m-pane__body">
          <Title headingLevel="h1">{t('Connectivity Link Overview')}</Title>
        </PageSection>
        <PageSection className="co-m-pane__body">
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

  const healthyGateways = gateways.filter(
    (gw) => getWorstConditionSeverity(gw.status?.conditions) === 'healthy',
  );
  const degradedGateways = gateways.filter(
    (gw) => {
      const s = getWorstConditionSeverity(gw.status?.conditions);
      return s === 'warning' || s === 'critical';
    },
  );

  return (
    <>
      <PageSection className="co-m-pane__body">
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">{t('Connectivity Link Overview')}</Title>
          </FlexItem>
          <FlexItem>
            <HostnameSearch />
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection className="co-m-pane__body">
        <Grid hasGutter>
          <GridItem span={4}>
            <Card>
              <CardTitle>{t('Gateways')}</CardTitle>
              <CardBody>
                <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                  <FlexItem>
                    <Label color="grey">{t('{{count}} total', { count: gateways.length })}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Label color="green" icon={<CheckCircleIcon />}>
                      {t('{{count}} healthy', { count: healthyGateways.length })}
                    </Label>
                  </FlexItem>
                  {degradedGateways.length > 0 && (
                    <FlexItem>
                      <Label color="orange" icon={<ExclamationTriangleIcon />}>
                        {t('{{count}} degraded', { count: degradedGateways.length })}
                      </Label>
                    </FlexItem>
                  )}
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardTitle>{t('HTTPRoutes')}</CardTitle>
              <CardBody>
                <Label color="grey">
                  {t('{{count}} total', { count: httpRoutes.length })}
                </Label>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardTitle>{t('Gateway health')}</CardTitle>
              <CardBody>
                {degradedGateways.length === 0 ? (
                  <Label color="green" icon={<CheckCircleIcon />}>
                    {t('All systems operational')}
                  </Label>
                ) : (
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    {degradedGateways.map((gw) => (
                      <FlexItem key={gw.metadata?.uid}>
                        <Label color="red" icon={<ExclamationCircleIcon />}>
                          {gw.metadata?.namespace}/{gw.metadata?.name}
                        </Label>
                      </FlexItem>
                    ))}
                  </Flex>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default OverviewPage;
