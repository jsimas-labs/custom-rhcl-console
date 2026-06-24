import * as React from 'react';
import {
  PageSection,
  Title,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { PlusCircleIcon, SyncAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import EnvironmentHealthSection from './EnvironmentHealthSection';
import TrafficOverviewSection from './TrafficOverviewSection';
import NeedsAttentionPanel from './NeedsAttentionPanel';
import GatewayOperationalCards from './GatewayOperationalCards';
import PolicyImpactTable from './PolicyImpactTable';
import RouteTrafficTable from './RouteTrafficTable';
import BackendHealthWidget from './BackendHealthWidget';
import RecentEventsPanel from './RecentEventsPanel';
import {
  MOCK_ENVIRONMENT_HEALTH,
  MOCK_TRAFFIC,
  MOCK_NEEDS_ATTENTION,
  MOCK_GATEWAYS,
  MOCK_POLICIES,
  MOCK_ROUTES,
  MOCK_BACKENDS,
  MOCK_EVENTS,
} from './mockOverviewData';

/**
 * Overview dashboard refactor — Phase 1-4 (mockup-first).
 *
 * Structure (top → bottom):
 *   1. Header (title + create actions + last-updated stamp)
 *   2. Environment Health (5 KPI cards)
 *   3. Traffic Overview (4 metric cards w/ sparklines)
 *      + Needs Attention (alongside, right column)
 *   4. Gateway operational cards | Policies | HTTPRoutes (3-column row)
 *   5. Backends (donut + table)
 *   6. Recent Events
 *
 * Data is currently mocked (mockOverviewData.ts). Phase 5 plan:
 *   - KPI counts: useResourceWithRBAC over GatewayGVK / HTTPRouteGVK / ...
 *   - Traffic metrics: usePrometheusTraffic (already implemented)
 *   - Backend health: useBackendsStatus + useBackendTraffic
 *   - Needs Attention: synth from policy.status.conditions + APIKey Pending
 *   - Events: k8s Events API
 *
 * Until then, this page is a true mock — kept this way intentionally so we
 * validate visual + UX first, then swap sources without redesigning.
 */
const OverviewPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const refresh = React.useCallback(() => setNow(new Date()), []);

  // Update the "last updated" label every minute so it stays fresh-looking
  // without re-fetching anything (mock data is static for now).
  React.useEffect(() => {
    const tid = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tid);
  }, []);

  const lastUpdatedLabel = React.useMemo(() => {
    const diffSec = Math.max(0, Math.floor((Date.now() - now.getTime()) / 1000));
    if (diffSec < 60) return t('just now');
    const m = Math.floor(diffSec / 60);
    return t('{{count}}m ago', { count: m });
  }, [now, t]);

  const createActions = React.useMemo(
    () => [
      { id: 'gateway', label: t('Gateway'), href: '/k8s/all-namespaces/gateway.networking.k8s.io~v1~Gateway/~new' },
      { id: 'httproute', label: t('HTTPRoute'), href: '/k8s/all-namespaces/gateway.networking.k8s.io~v1~HTTPRoute/~new' },
      { id: 'policy', label: t('Policy'), href: '/k8s/all-namespaces/kuadrant.io~v1~AuthPolicy/~new' },
      { id: 'apiproduct', label: t('API Product'), href: '/k8s/all-namespaces/devportal.kuadrant.io~v1alpha1~APIProduct/~new' },
    ],
    [t],
  );

  return (
    <>
      <PageSection variant="default">
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">{t('Overview')}</Title>
            <div
              style={{
                marginTop: 4,
                fontSize: 14,
                color: 'var(--pf-v5-global--Color--200)',
              }}
            >
              {t('Real-time summary of your API gateway environment')}
            </div>
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <Dropdown
                  isOpen={isCreateOpen}
                  onSelect={() => setIsCreateOpen(false)}
                  onOpenChange={(o) => setIsCreateOpen(o)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      variant="primary"
                      icon={<PlusCircleIcon />}
                      onClick={() => setIsCreateOpen((o) => !o)}
                      isExpanded={isCreateOpen}
                    >
                      {t('Create')}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    {createActions.map((a) => (
                      <DropdownItem
                        key={a.id}
                        to={a.href}
                        component="a"
                      >
                        {a.label}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </FlexItem>
              <FlexItem>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--pf-v5-global--Color--200)',
                  }}
                >
                  {t('Last updated: {{when}}', { when: lastUpdatedLabel })}
                </span>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="plain"
                  aria-label={t('Refresh')}
                  onClick={refresh}
                >
                  <SyncAltIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* 2. Environment Health */}
      <PageSection>
        <EnvironmentHealthSection cards={MOCK_ENVIRONMENT_HEALTH} />
      </PageSection>

      {/* 3. Traffic Overview + Needs Attention side-by-side */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={8} md={12}>
            <TrafficOverviewSection metrics={MOCK_TRAFFIC} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <NeedsAttentionPanel items={MOCK_NEEDS_ATTENTION} onViewAll={() => undefined} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* 4. Gateways operational cards — full width so the per-gateway
          metrics row has room for all 5 KPIs without truncating. */}
      <PageSection>
        <GatewayOperationalCards gateways={MOCK_GATEWAYS} />
      </PageSection>

      {/* 5. Policies + HTTPRoutes — 50/50 split. Both render tables, so
          they need wider columns than the previous 3-column layout gave
          them (Policy table has 5 columns, HTTPRoute table has 7). */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={6} md={12}>
            <PolicyImpactTable rows={MOCK_POLICIES} />
          </GridItem>
          <GridItem lg={6} md={12}>
            <RouteTrafficTable rows={MOCK_ROUTES} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* 5. Backends */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={8} md={12}>
            <BackendHealthWidget rows={MOCK_BACKENDS} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <RecentEventsPanel events={MOCK_EVENTS} />
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default OverviewPage;
