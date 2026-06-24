import * as React from 'react';
import { Card, CardBody, Flex, FlexItem } from '@patternfly/react-core';
import {
  ArrowUpIcon,
  ArrowDownIcon,
} from '@patternfly/react-icons';
import Sparkline from './Sparkline';
import { TrafficMetricData } from './mockOverviewData';

interface Props {
  data: TrafficMetricData;
}

/**
 * One operational traffic KPI: label, large value, % trend indicator,
 * sparkline. Colors trend green/red purely from the `trendIsGood` flag —
 * a falling Error Rate is good (green) even though the arrow points down,
 * so we never derive color from direction alone.
 */
export const TrafficMetricCard: React.FC<Props> = ({ data }) => {
  const trendColor = data.trendIsGood
    ? 'var(--pf-v5-global--success-color--100)'
    : 'var(--pf-v5-global--danger-color--100)';
  const sparkColor = data.trendIsGood
    ? 'var(--pf-v5-global--success-color--100)'
    : 'var(--pf-v5-global--danger-color--100)';

  const TrendArrow = data.trendDirection === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendText = `${data.trendDeltaPct}%`;

  return (
    <Card isCompact aria-label={`${data.label} metric`}>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
          <FlexItem>
            <span
              style={{
                fontSize: 13,
                color: 'var(--pf-v5-global--Color--200)',
              }}
            >
              {data.label}
            </span>
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsBaseline' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--pf-v5-global--Color--100)',
                  }}
                >
                  {data.value}
                </span>
              </FlexItem>
              <FlexItem>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    color: trendColor,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <TrendArrow aria-hidden="true" />
                  {trendText}
                </span>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <div style={{ color: sparkColor }}>
              <Sparkline data={data.sparkline} color={sparkColor} width={220} height={40} />
            </div>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default TrafficMetricCard;
