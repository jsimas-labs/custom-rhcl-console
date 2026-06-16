import * as React from 'react';
import {
  DrawerHead, DrawerActions, DrawerCloseButton,
  Tabs, Tab, TabTitleText,
  Title, Label, Flex, FlexItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../types/httproute';
import { derivedStatusFor, labelColorForStatus } from './utils/backendDerivedStatus';
import { DedupedBackend } from './utils/dedupeBackends';
import { BackendOverviewTab } from './tabs/BackendOverviewTab';
import { BackendMetricsTab }  from './tabs/BackendMetricsTab';
import { BackendProbeTab }    from './tabs/BackendProbeTab';
import { BackendPodsTab }     from './tabs/BackendPodsTab';
import { BackendYamlTab }     from './tabs/BackendYamlTab';

interface Props {
  backend: DedupedBackend;
  route: HTTPRoute | undefined;
  onClose: () => void;
}

/**
 * Right-panel content. DrawerHead with backend identity + status badge,
 * then PF Tabs with the five views.
 *
 * Tab state is local to the drawer — selecting a different row reopens
 * the drawer fresh (Overview), which matches the model "drawer reflects
 * the current row". If we ever want to remember which tab the operator
 * had open across rows, lift `activeKey` to the parent.
 */
export const BackendDetailDrawer: React.FC<Props> = ({ backend, route, onClose }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [activeKey, setActiveKey] = React.useState<string | number>('overview');
  const d = derivedStatusFor(backend);

  return (
    <>
      <DrawerHead>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Title
                  headingLevel="h2"
                  size="lg"
                  style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}
                >
                  {backend.name}
                </Title>
              </FlexItem>
              <FlexItem>
                <Label color={labelColorForStatus(d.status)} isCompact>
                  {t(d.statusKey)}
                </Label>
              </FlexItem>
              <FlexItem>
                <Label color="blue" isCompact>{`port ${backend.port ?? '?'}`}</Label>
              </FlexItem>
              <FlexItem>
                <Label color="grey" isCompact>
                  {t('Used in {{n}} rule(s)', { n: backend.ruleCount })}
                </Label>
              </FlexItem>
              {backend.weights.some((w) => w !== 1) && (
                <FlexItem>
                  <Label color="orange" isCompact>
                    {t('weight: {{ws}}', { ws: backend.weights.join(', ') })}
                  </Label>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>
          <FlexItem>
            <span
              style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}
            >
              {backend.namespace}
            </span>
          </FlexItem>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>

      <Tabs
        activeKey={activeKey}
        onSelect={(_e, k) => setActiveKey(k)}
        aria-label={t('Backend details')}
        isBox
      >
        <Tab eventKey="overview" title={<TabTitleText>{t('Overview')}</TabTitleText>}>
          <BackendOverviewTab backend={backend} route={route} />
        </Tab>
        <Tab eventKey="metrics"  title={<TabTitleText>{t('Metrics')}</TabTitleText>}>
          <BackendMetricsTab backend={backend} route={route} />
        </Tab>
        <Tab eventKey="probe"    title={<TabTitleText>{t('Probe')}</TabTitleText>}>
          <BackendProbeTab backend={backend} route={route} />
        </Tab>
        <Tab
          eventKey="pods"
          title={
            <TabTitleText>
              {t('Pods')}{' '}
              <span
                style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
              >
                ({backend.podNames.length})
              </span>
            </TabTitleText>
          }
        >
          <BackendPodsTab backend={backend} />
        </Tab>
        <Tab eventKey="yaml" title={<TabTitleText>{t('YAML')}</TabTitleText>}>
          <BackendYamlTab backend={backend} />
        </Tab>
      </Tabs>
    </>
  );
};
