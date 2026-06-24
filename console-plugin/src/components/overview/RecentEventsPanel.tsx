import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
  Label,
} from '@patternfly/react-core';
import { RecentEvent } from './mockOverviewData';

interface Props {
  events: RecentEvent[];
}

const SEVERITY_COLOR: Record<RecentEvent['severity'], 'green' | 'blue' | 'orange' | 'red'> = {
  success: 'green',
  info: 'blue',
  warning: 'orange',
  critical: 'red',
};

const SEVERITY_LABEL: Record<RecentEvent['severity'], string> = {
  success: 'Success',
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

/**
 * Stream of operational activity. In Phase 5 this should source from the
 * k8s Events API, filtered to RHCL-owned resources (Gateways, HTTPRoutes,
 * Policies, APIKey secrets), plus controller-emitted events from the
 * Kuadrant operator status conditions.
 */
export const RecentEventsPanel: React.FC<Props> = ({ events }) => {
  return (
    <Card aria-label="Recent events">
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>Recent Events</FlexItem>
          <FlexItem>
            <Button variant="link" isInline component="a" href="#/events">
              View all
            </Button>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {events.map((e) => (
            <FlexItem key={e.id}>
              <a
                href={e.href}
                style={{
                  display: 'block',
                  padding: '8px 0',
                  color: 'inherit',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                }}
              >
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                  spaceItems={{ default: 'spaceItemsMd' }}
                >
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <div style={{ fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                      {e.occurredAt}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--pf-v5-global--Color--100)' }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                      {e.detail}
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact color={SEVERITY_COLOR[e.severity]} variant="outline">
                      {SEVERITY_LABEL[e.severity]}
                    </Label>
                  </FlexItem>
                </Flex>
              </a>
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default RecentEventsPanel;
