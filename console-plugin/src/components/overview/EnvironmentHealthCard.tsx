import * as React from 'react';
import {
  Card,
  CardBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  AngleRightIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  EnvironmentHealthCardData,
  HealthSeverity,
} from './mockOverviewData';

interface EnvironmentHealthCardProps {
  data: EnvironmentHealthCardData;
  iconSlot?: React.ReactNode;
}

const severityColor: Record<HealthSeverity, string> = {
  healthy: 'var(--pf-v5-global--success-color--100)',
  warning: 'var(--pf-v5-global--warning-color--100)',
  critical: 'var(--pf-v5-global--danger-color--100)',
  info: 'var(--pf-v5-global--info-color--100)',
  accepted: 'var(--pf-v5-global--palette--purple-300, #8476d1)',
};

const SeverityDot: React.FC<{ severity: HealthSeverity }> = ({ severity }) => {
  const props = { color: severityColor[severity], 'aria-hidden': true };
  switch (severity) {
    case 'healthy':
      return <CheckCircleIcon {...props} />;
    case 'warning':
      return <ExclamationTriangleIcon {...props} />;
    case 'critical':
      return <ExclamationCircleIcon {...props} />;
    case 'accepted':
    case 'info':
    default:
      return <InfoCircleIcon {...props} />;
  }
};

/**
 * Single Environment Health card — title, large total, status breakdown
 * row with colored dot icons. Whole card is a navigable link to the
 * relevant list page.
 */
export const EnvironmentHealthCard: React.FC<EnvironmentHealthCardProps> = ({
  data,
  iconSlot,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  return (
    <Card
      isClickable
      isCompact
      aria-label={t('{{title}} health summary', { title: t(data.title) })}
    >
      <CardBody>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsXs' }}
        >
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
            >
              <FlexItem>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsSm' }}
                >
                  {iconSlot && <FlexItem>{iconSlot}</FlexItem>}
                  <FlexItem>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--pf-v5-global--Color--100)',
                      }}
                    >
                      {t(data.title)}
                    </span>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <a
                  href={data.href}
                  style={{ display: 'inline-flex' }}
                  aria-label={t('Open all {{title}}', { title: t(data.title) })}
                >
                  <AngleRightIcon
                    color="var(--pf-v5-global--Color--200)"
                    aria-hidden="true"
                  />
                </a>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--pf-v5-global--Color--100)',
              }}
            >
              {data.total}
            </div>
          </FlexItem>
          <FlexItem>
            <Flex
              spaceItems={{ default: 'spaceItemsMd' }}
              flexWrap={{ default: 'wrap' }}
            >
              {data.breakdown.map((b) => (
                <FlexItem key={b.label}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--pf-v5-global--Color--200)',
                    }}
                  >
                    <SeverityDot severity={b.severity} />
                    {t(b.label)}
                  </span>
                </FlexItem>
              ))}
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default EnvironmentHealthCard;
