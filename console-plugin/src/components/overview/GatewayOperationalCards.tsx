import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  AngleRightIcon,
} from '@patternfly/react-icons';
import { GatewayOpData } from './mockOverviewData';

interface Props {
  gateways: GatewayOpData[];
}

const HealthBadge: React.FC<{ health: GatewayOpData['health'] }> = ({ health }) => {
  const map = {
    healthy: { color: 'var(--pf-v5-global--success-color--100)', label: 'Healthy', icon: <CheckCircleIcon aria-hidden="true" /> },
    warning: { color: 'var(--pf-v5-global--warning-color--100)', label: 'Warning', icon: <ExclamationTriangleIcon aria-hidden="true" /> },
    critical: { color: 'var(--pf-v5-global--danger-color--100)', label: 'Degraded', icon: <ExclamationCircleIcon aria-hidden="true" /> },
    info: { color: 'var(--pf-v5-global--info-color--100)', label: 'Info', icon: <CheckCircleIcon aria-hidden="true" /> },
    accepted: { color: 'var(--pf-v5-global--info-color--100)', label: 'Accepted', icon: <CheckCircleIcon aria-hidden="true" /> },
  };
  const { color, label, icon } = map[health];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color, fontSize: 12, fontWeight: 500 }}>
      {icon}
      {label}
    </span>
  );
};

const Metric: React.FC<{ label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }> = ({
  label, value, tone = 'neutral',
}) => {
  const color =
    tone === 'good' ? 'var(--pf-v5-global--success-color--100)' :
    tone === 'bad' ? 'var(--pf-v5-global--danger-color--100)' :
    'var(--pf-v5-global--Color--100)';
  return (
    <FlexItem>
      <div style={{ fontSize: 11, color: 'var(--pf-v5-global--Color--200)' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color }}>{value}</div>
    </FlexItem>
  );
};

/**
 * Gateway operational cards — one per gateway, each showing health badge,
 * traffic, success/error rates, route/policy counts. Cards stack inside a
 * single titled section card with a "View all" link.
 */
export const GatewayOperationalCards: React.FC<Props> = ({ gateways }) => {
  return (
    <Card aria-label="Gateways">
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>Gateways</FlexItem>
          <FlexItem>
            <Button variant="link" isInline component="a" href="/k8s/all-namespaces/gateway.networking.k8s.io~v1~Gateway">
              View all
            </Button>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {gateways.map((gw) => {
            const errorIsBad = gw.errorRatePct >= 5;
            return (
              <FlexItem key={gw.id}>
                <a href={gw.href} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)',
                      border: '1px solid var(--pf-v5-global--BorderColor--100)',
                    }}
                  >
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      justifyContent={{ default: 'justifyContentSpaceBetween' }}
                    >
                      <FlexItem>
                        <Flex
                          alignItems={{ default: 'alignItemsCenter' }}
                          spaceItems={{ default: 'spaceItemsSm' }}
                        >
                          <FlexItem>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pf-v5-global--Color--100)' }}>
                              {gw.name}
                            </div>
                          </FlexItem>
                          <FlexItem>
                            <HealthBadge health={gw.health} />
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <AngleRightIcon color="var(--pf-v5-global--Color--200)" aria-hidden="true" />
                      </FlexItem>
                    </Flex>
                    <Flex
                      spaceItems={{ default: 'spaceItemsLg' }}
                      style={{ marginTop: 10 }}
                    >
                      <Metric label="Requests / min" value={gw.requestsPerMin.toLocaleString('en-US')} />
                      <Metric label="Success Rate" value={`${gw.successRatePct}%`} tone={gw.successRatePct >= 95 ? 'good' : 'neutral'} />
                      <Metric label="Error Rate" value={`${gw.errorRatePct}%`} tone={errorIsBad ? 'bad' : 'neutral'} />
                      <Metric label="Routes" value={String(gw.routesCount)} />
                      <Metric label="Policies" value={String(gw.policiesCount)} />
                    </Flex>
                  </div>
                </a>
              </FlexItem>
            );
          })}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default GatewayOperationalCards;
