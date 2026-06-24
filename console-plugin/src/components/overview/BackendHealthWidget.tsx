import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import Sparkline from './Sparkline';
import { BackendRow, HealthSeverity } from './mockOverviewData';

interface Props {
  rows: BackendRow[];
}

/**
 * Inline donut written as SVG arc segments (cheaper than wiring
 * @patternfly/react-charts just for a 64x64 indicator). Three slices:
 * healthy / warning / down. Center number is total backends.
 */
const Donut: React.FC<{ healthy: number; warning: number; critical: number }> = ({
  healthy,
  warning,
  critical,
}) => {
  const size = 110;
  const r = 42;
  const cx = size / 2;
  const cy = size / 2;
  const total = healthy + warning + critical || 1;
  const segments = [
    { value: healthy, color: 'var(--pf-v5-global--success-color--100)' },
    { value: warning, color: 'var(--pf-v5-global--warning-color--100)' },
    { value: critical, color: 'var(--pf-v5-global--danger-color--100)' },
  ];
  let angleAcc = -90; // start at 12 o'clock
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s, i) => {
      const angle = (s.value / total) * 360;
      const a0 = (angleAcc * Math.PI) / 180;
      const a1 = ((angleAcc + angle) * Math.PI) / 180;
      angleAcc += angle;
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const largeArc = angle > 180 ? 1 : 0;
      const d = `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
      return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={12} strokeLinecap="butt" />;
    });
  return (
    <svg width={size} height={size} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--pf-v5-global--BorderColor--100)" strokeWidth={12} />
      {arcs}
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill="var(--pf-v5-global--Color--100)"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontSize={10}
        fill="var(--pf-v5-global--Color--200)"
      >
        Total
      </text>
    </svg>
  );
};

const HEALTH_ICON: Record<HealthSeverity, React.ReactNode> = {
  healthy: <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" aria-hidden="true" />,
  warning: <ExclamationTriangleIcon color="var(--pf-v5-global--warning-color--100)" aria-hidden="true" />,
  critical: <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" aria-hidden="true" />,
  info: <CheckCircleIcon color="var(--pf-v5-global--info-color--100)" aria-hidden="true" />,
  accepted: <CheckCircleIcon color="var(--pf-v5-global--info-color--100)" aria-hidden="true" />,
};

const HEALTH_LABEL: Record<HealthSeverity, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Down',
  info: 'Info',
  accepted: 'Accepted',
};

export const BackendHealthWidget: React.FC<Props> = ({ rows }) => {
  const counts = React.useMemo(() => {
    let h = 0, w = 0, c = 0;
    for (const r of rows) {
      if (r.health === 'healthy') h++;
      else if (r.health === 'warning') w++;
      else if (r.health === 'critical') c++;
    }
    return { h, w, c };
  }, [rows]);

  return (
    <Card aria-label="Backend health">
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>Backends</FlexItem>
          <FlexItem>
            <Button variant="link" isInline component="a" href="#/backends">
              View all
            </Button>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Flex spaceItems={{ default: 'spaceItemsXl' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <Donut healthy={counts.h} warning={counts.w} critical={counts.c} />
              </FlexItem>
              <FlexItem>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--pf-v5-global--success-color--100)' }} />
                      {counts.h} Healthy
                    </span>
                  </FlexItem>
                  <FlexItem>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--pf-v5-global--warning-color--100)' }} />
                      {counts.w} Warning
                    </span>
                  </FlexItem>
                  <FlexItem>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--pf-v5-global--danger-color--100)' }} />
                      {counts.c} Down
                    </span>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Table variant="compact" borders={false} aria-label="Backends">
              <Thead>
                <Tr>
                  <Th>Backend</Th>
                  <Th>Namespace</Th>
                  <Th>Health</Th>
                  <Th>Req / min</Th>
                  <Th>Trend</Th>
                  <Th>Error</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr key={r.id}>
                    <Td>
                      <a href={r.href}>{r.name}</a>
                    </Td>
                    <Td>{r.namespace}</Td>
                    <Td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        {HEALTH_ICON[r.health]}
                        {HEALTH_LABEL[r.health]}
                      </span>
                    </Td>
                    <Td>{r.requestsPerMin.toLocaleString('en-US')}</Td>
                    <Td>
                      <div style={{ color: 'var(--pf-v5-global--info-color--100)' }}>
                        <Sparkline data={r.sparkline} width={80} height={24} strokeWidth={1.25} />
                      </div>
                    </Td>
                    <Td>{r.errorRatePct}%</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BackendHealthWidget;
