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
import { Link } from 'react-router-dom';
import EnvironmentHealthSection from './EnvironmentHealthSection';
import TrafficOverviewSection from './TrafficOverviewSection';
import NeedsAttentionPanel from './NeedsAttentionPanel';
import GatewayOperationalCards from './GatewayOperationalCards';
import PolicyImpactTable from './PolicyImpactTable';
import RouteTrafficTable from './RouteTrafficTable';
import BackendHealthWidget from './BackendHealthWidget';
import RecentEventsPanel from './RecentEventsPanel';
import { useEnvironmentHealth } from '../../hooks/useEnvironmentHealth';
import { useOverviewTraffic } from '../../hooks/useOverviewTraffic';
import { useNeedsAttention } from '../../hooks/useNeedsAttention';
import { useGatewayOperationalData } from '../../hooks/useGatewayOperationalData';
import { usePolicyImpactRows } from '../../hooks/usePolicyImpactRows';
import { useRouteTraffic } from '../../hooks/useRouteTraffic';
import { useBackendHealth } from '../../hooks/useBackendHealth';
import { useRecentEvents } from '../../hooks/useRecentEvents';
import '../../styles/plugin-glass.css';

/**
 * Operational overview dashboard. All sections are wired to live cluster +
 * Prometheus data — no mocks.
 *
 *   1. Header (title + create actions + last-updated stamp)
 *   2. Environment Health — useEnvironmentHealth (5 KPI cards)
 *   3. Traffic Overview  — useOverviewTraffic (rps/success/error/p95 + sparks)
 *      + Needs Attention — useNeedsAttention (policy status, APIKey pending,
 *        per-gateway error threshold)
 *   4. Gateway operational cards — useGatewayOperationalData
 *      Policies + HTTPRoutes side-by-side — usePolicyImpactRows + useRouteTraffic
 *   5. Backends — useBackendHealth (derived from HTTPRoute backendRefs)
 *      Recent Events — useRecentEvents (k8s Events filtered by RHCL kinds)
 *
 * Type contracts for the rows passed into each section live in
 * `./types.ts`. The hook layer is the only place that knows about
 * Prometheus and CR shapes; everything below the hook is presentational.
 */
const OverviewPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const { cards: envHealthCards } = useEnvironmentHealth();
  const { metrics: trafficMetrics } = useOverviewTraffic();
  const { items: needsAttentionItems } = useNeedsAttention();
  const { gateways: gatewayOpRows } = useGatewayOperationalData();
  const { rows: policyImpactRows } = usePolicyImpactRows();
  const { rows: routeTrafficRows } = useRouteTraffic();
  const { rows: backendHealthRows } = useBackendHealth();
  const { events: recentEvents } = useRecentEvents();

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
    <div className="rhcl-plugin-root">
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
                        component={Link}
                        to={a.href}
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
        <EnvironmentHealthSection cards={envHealthCards} />
      </PageSection>

      {/* 3. Traffic Overview + Needs Attention side-by-side */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={8} md={12}>
            <TrafficOverviewSection
              metrics={trafficMetrics}
              windowLabel={t('(Compared to 1h ago)')}
            />
          </GridItem>
          <GridItem lg={4} md={12}>
            <NeedsAttentionPanel items={needsAttentionItems} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* 4. Gateways operational cards — full width so the per-gateway
          metrics row has room for all 5 KPIs without truncating. */}
      <PageSection>
        <GatewayOperationalCards gateways={gatewayOpRows} />
      </PageSection>

      {/* 5. Policies + HTTPRoutes — 50/50 split. Both render tables, so
          they need wider columns than the previous 3-column layout gave
          them (Policy table has 5 columns, HTTPRoute table has 7). */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={6} md={12}>
            <PolicyImpactTable rows={policyImpactRows} />
          </GridItem>
          <GridItem lg={6} md={12}>
            <RouteTrafficTable rows={routeTrafficRows} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* 5. Backends */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={8} md={12}>
            <BackendHealthWidget rows={backendHealthRows} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <RecentEventsPanel events={recentEvents} />
          </GridItem>
        </Grid>
      </PageSection>
    </div>
  );
};

export default OverviewPage;
