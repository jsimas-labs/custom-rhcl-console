import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  PageSection,
  Progress,
  ProgressSize,
  Spinner,
  Title,
} from '@patternfly/react-core';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { consoleFetch, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { usePrometheusRange } from '../../hooks/usePrometheusRange';
import { RateLimitPolicyGVK } from '../../models';
import { RateLimitPolicy } from '../../types';
import { primaryTargetRef } from '../../utils/policyTargets';

// ---------------------------------------------------------------------------
// Page-level Prometheus queries — cluster-wide aggregations rather than
// per-target. Lets the operator see "what's getting throttled across the
// platform right now" instead of clicking one policy at a time.
// ---------------------------------------------------------------------------

const CLUSTER_ALLOWED_RANGE =
  'sum(rate(istio_requests_total{reporter="source", response_code=~"[23].."}[5m]))';
const CLUSTER_REJECTED_RANGE =
  'sum(rate(istio_requests_total{reporter="source", response_code="429"}[5m]))';
const CLUSTER_REJECTION_RATE_RANGE =
  'sum(rate(istio_requests_total{reporter="source", response_code="429"}[5m])) / ' +
  'clamp_min(sum(rate(istio_requests_total{reporter="source"}[5m])), 0.001) * 100';
const TOP_CONSUMERS_REJECTED = (topN: number) =>
  `topk(${topN}, sum by (request_headers_x_consumer_id) (` +
  `rate(istio_requests_total{reporter="source", response_code="429", ` +
  `request_headers_x_consumer_id!="", request_headers_x_consumer_id!="unknown"}[1h])))`;
const TOP_ROUTES_REJECTED = (topN: number) =>
  `topk(${topN}, sum by (route_name) (` +
  `rate(istio_requests_total{reporter="source", response_code="429"}[1h])))`;
const PER_CONSUMER_CURRENT_RATE = (topN: number) =>
  `topk(${topN}, sum by (request_headers_x_consumer_id) (` +
  `rate(istio_requests_total{reporter="source", ` +
  `request_headers_x_consumer_id!="", request_headers_x_consumer_id!="unknown"}[5m])))`;

const COLORS = ['#3E8635', '#C9190B'];

// Victory auto-scales tick labels based on viewBox size. A wide+short
// chart (full-width card, 200px tall) blows the default fontSize up to
// ~30px on the Y axis. Force a sane size so the chart looks proportional.
const AXIS_STYLE = {
  tickLabels: { fontSize: 11, fill: 'var(--pf-v5-global--Color--100)' },
  axisLabel: { fontSize: 12 },
  grid: { stroke: 'transparent' },
};

// Saturation thresholds match the proposal — the same scale is used by
// the consumer table and by the "rejection rate" KPI tone below.
// PatternFly Label palette has no `gold` — use `yellow` for the watch tone,
// which is the closest semantic match (yellow ≈ caution, not yet critical).
function saturationTone(pct: number): { color: 'red' | 'orange' | 'yellow' | 'green'; label: string } {
  if (pct >= 95) return { color: 'red', label: 'Critical' };
  if (pct >= 80) return { color: 'orange', label: 'Warning' };
  if (pct >= 50) return { color: 'yellow', label: 'Watch' };
  return { color: 'green', label: 'Healthy' };
}

// ---------------------------------------------------------------------------

const RateLimitAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1">{t('Rate-limit analytics')}</Title>
        <p style={{ marginTop: 4, color: 'var(--pf-v5-global--Color--200)' }}>
          {t('Cluster-wide view of who is hitting limits, on which routes, and how often.')}
        </p>
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          {/* Hero — Allowed vs Rejected over the last hour. */}
          <GridItem span={12}>
            <AllowedVsRejectedCard />
          </GridItem>

          <GridItem md={6}>
            <RejectionRateTrendCard />
          </GridItem>
          <GridItem md={6}>
            <TopRoutesByRejectionCard />
          </GridItem>

          <GridItem md={6}>
            <TopConsumersByRejectionCard />
          </GridItem>
          <GridItem md={6}>
            <SaturatedConsumersCard />
          </GridItem>

          <GridItem span={12}>
            <TopTriggeredPoliciesCard />
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

// ---------------------------------------------------------------------------
// Chart cards
// ---------------------------------------------------------------------------

function formatTime(input: Date | number | string): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AllowedVsRejectedCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const queries = React.useMemo(
    () => [
      { label: t('Allowed'), query: CLUSTER_ALLOWED_RANGE },
      { label: t('Rejected'), query: CLUSTER_REJECTED_RANGE },
    ],
    [t],
  );
  const { series, loaded, metricsAvailable } = usePrometheusRange(queries, 3600, 60);
  const hasData = series.some((s) => s.data.length > 0);

  return (
    <Card isCompact>
      <CardTitle>
        {t('Allowed vs rejected requests')}{' '}
        <span style={{ fontWeight: 400, color: 'var(--pf-v5-global--Color--300)' }}>
          ({t('last hour, cluster-wide')})
        </span>
      </CardTitle>
      {/* Constrain the card body so Victory's auto-scaling can't blow the
          chart up to viewport height (which also inflates axis fonts). */}
      <CardBody style={{ maxHeight: 260 }}>
        {!metricsAvailable ? (
          <Empty>{t('Cluster Prometheus is unreachable')}</Empty>
        ) : !loaded ? (
          <Empty>{t('Loading…')}</Empty>
        ) : !hasData ? (
          <Empty>{t('No traffic recorded in the window.')}</Empty>
        ) : (
          <Chart
            // Explicit, modest height + fixed width = stable axis font scaling.
            height={200}
            padding={{ top: 10, bottom: 50, left: 50, right: 20 }}
            scale={{ x: 'time' }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: { x: Date; y: number; childName: string } }) =>
                  `${datum.childName}: ${datum.y?.toFixed(2)} req/s`
                }
              />
            }
            legendData={[
              { name: t('Allowed'), symbol: { fill: COLORS[0] } },
              { name: t('Rejected'), symbol: { fill: COLORS[1] } },
            ]}
            legendPosition="bottom"
            themeColor={ChartThemeColor.multiUnordered}
          >
            <ChartAxis tickFormat={(t) => formatTime(t)} fixLabelOverlap style={AXIS_STYLE} />
            <ChartAxis dependentAxis tickFormat={(t: number) => t.toFixed(1)} style={AXIS_STYLE} />
            <ChartGroup>
              {series.map((s, i) => (
                <ChartArea
                  key={s.label}
                  name={s.label}
                  data={s.data.map((d) => ({ x: d.x, y: d.y }))}
                  style={{
                    data: {
                      fill: COLORS[i],
                      fillOpacity: 0.3,
                      stroke: COLORS[i],
                    },
                  }}
                />
              ))}
            </ChartGroup>
          </Chart>
        )}
      </CardBody>
    </Card>
  );
}

function RejectionRateTrendCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const queries = React.useMemo(
    () => [{ label: t('Rejection rate'), query: CLUSTER_REJECTION_RATE_RANGE }],
    [t],
  );
  const { series, loaded, metricsAvailable } = usePrometheusRange(queries, 86_400, 300);
  const hasData = series.some((s) => s.data.length > 0);

  return (
    <Card isCompact isFullHeight>
      <CardTitle>{t('Rejection rate trend')} ({t('last 24h')})</CardTitle>
      <CardBody>
        {!metricsAvailable ? (
          <Empty>{t('Cluster Prometheus is unreachable')}</Empty>
        ) : !loaded ? (
          <Empty>{t('Loading…')}</Empty>
        ) : !hasData ? (
          <Empty>{t('No traffic recorded in the window.')}</Empty>
        ) : (
          <Chart
            height={220}
            padding={{ top: 10, bottom: 50, left: 60, right: 20 }}
            scale={{ x: 'time' }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: { x: Date; y: number } }) =>
                  `${datum.y?.toFixed(2)}%`
                }
              />
            }
          >
            <ChartAxis tickFormat={(t) => formatTime(t)} fixLabelOverlap style={AXIS_STYLE} />
            <ChartAxis dependentAxis tickFormat={(t: number) => `${t.toFixed(1)}%`} style={AXIS_STYLE} />
            <ChartGroup>
              {series.map((s) => (
                <ChartArea
                  key={s.label}
                  name={s.label}
                  data={s.data.map((d) => ({ x: d.x, y: d.y }))}
                  style={{
                    data: {
                      fill: COLORS[1],
                      fillOpacity: 0.25,
                      stroke: COLORS[1],
                    },
                  }}
                />
              ))}
            </ChartGroup>
          </Chart>
        )}
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Ranking cards — three of them, all share the same instant-query shape.
// ---------------------------------------------------------------------------

type Bucket = { key: string; value: number };

function useInstantTopK(query: string, pollMs = 60_000): { rows: Bucket[]; loaded: boolean } {
  const [rows, setRows] = React.useState<Bucket[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
        const res = await consoleFetch(url);
        const json = await res.json();
        const result: { metric: Record<string, string>; value: [number, string] }[] =
          json?.data?.result || [];
        if (cancelled) return;
        setRows(
          result
            .map((r) => ({
              key:
                r.metric.request_headers_x_consumer_id ||
                r.metric.route_name ||
                'unknown',
              value: parseFloat(r.value[1]) || 0,
            }))
            .sort((a, b) => b.value - a.value),
        );
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    fetchOnce();
    const handle = setInterval(fetchOnce, pollMs);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [query, pollMs]);

  return { rows, loaded };
}

function RankingCard({
  title,
  hint,
  query,
  unit,
  emptyMsg,
}: {
  title: string;
  hint?: string;
  query: string;
  unit: string;
  emptyMsg: string;
}) {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { rows, loaded } = useInstantTopK(query);
  const max = rows[0]?.value ?? 0;

  return (
    <Card isCompact isFullHeight>
      <CardTitle>
        {title}
        {hint && (
          <span style={{ fontWeight: 400, color: 'var(--pf-v5-global--Color--300)', marginLeft: 6 }}>
            {hint}
          </span>
        )}
      </CardTitle>
      <CardBody>
        {!loaded ? (
          <Bullseye style={{ minHeight: 120 }}>
            <Spinner size="md" />
          </Bullseye>
        ) : rows.length === 0 ? (
          <Empty>{emptyMsg}</Empty>
        ) : (
          <div>
            {rows.map((b) => (
              <div key={b.key} style={{ marginBottom: 12 }}>
                <Progress
                  value={max > 0 ? (b.value / max) * 100 : 0}
                  title={b.key}
                  label={`${b.value.toFixed(3)} ${unit}`}
                  valueText={`${b.value.toFixed(3)} ${unit}`}
                  size={ProgressSize.sm}
                />
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--pf-v5-global--Color--300)', marginTop: 6 }}>
              {t('Bars are relative to the leader.')}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function TopConsumersByRejectionCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  return (
    <RankingCard
      title={t('Top consumers by rejection')}
      hint={`(${t('last hour')})`}
      query={TOP_CONSUMERS_REJECTED(10)}
      unit={t('rejected/s')}
      emptyMsg={t('No 429 responses recorded in the last hour.')}
    />
  );
}

function TopRoutesByRejectionCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  return (
    <RankingCard
      title={t('Top routes by rejection')}
      hint={`(${t('last hour')})`}
      query={TOP_ROUTES_REJECTED(10)}
      unit={t('rejected/s')}
      emptyMsg={t('No 429 responses recorded in the last hour.')}
    />
  );
}

// ---------------------------------------------------------------------------
// Top Triggered Policies — combines K8s policy list (so we can resolve names)
// with route_name rejection rates from Prometheus, joining on the policy's
// target HTTPRoute.
// ---------------------------------------------------------------------------

function TopTriggeredPoliciesCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [policies] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const { rows: rejectionsByRoute, loaded } = useInstantTopK(TOP_ROUTES_REJECTED(50));

  // Build "policy → rejection rate" by matching the policy's target HTTPRoute
  // to the `<ns>.<route>` prefix Istio uses in `route_name`.
  const policyRows = React.useMemo(() => {
    const byRouteKey = new Map<string, number>();
    for (const r of rejectionsByRoute) {
      // route_name shape: "<ns>.<route>.<rule_idx>" — fold per route.
      const parts = r.key.split('.');
      if (parts.length < 2) continue;
      const routeKey = `${parts[0]}/${parts[1]}`;
      byRouteKey.set(routeKey, (byRouteKey.get(routeKey) || 0) + r.value);
    }
    return (policies || [])
      .map((p) => {
        const ref = primaryTargetRef(p);
        if (!ref || ref.kind !== 'HTTPRoute') return null;
        const ns = ref.namespace || p.metadata?.namespace || '';
        const routeKey = `${ns}/${ref.name}`;
        const rate = byRouteKey.get(routeKey) || 0;
        return {
          ns: p.metadata?.namespace || '',
          name: p.metadata?.name || '',
          target: `${ref.kind}/${ref.name}`,
          rate,
        };
      })
      .filter((r): r is { ns: string; name: string; target: string; rate: number } => r !== null)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);
  }, [policies, rejectionsByRoute]);

  return (
    <Card isCompact>
      <CardTitle>
        {t('Top triggered RateLimitPolicies')}{' '}
        <span style={{ fontWeight: 400, color: 'var(--pf-v5-global--Color--300)' }}>
          ({t('last hour')})
        </span>
      </CardTitle>
      <CardBody>
        {!loaded ? (
          <Bullseye style={{ minHeight: 120 }}>
            <Spinner size="md" />
          </Bullseye>
        ) : policyRows.length === 0 ? (
          <Empty>{t('No RateLimitPolicy triggered a rejection in the window.')}</Empty>
        ) : (
          <Table aria-label={t('Top triggered policies')}>
            <Thead>
              <Tr>
                <Th>{t('Policy')}</Th>
                <Th>{t('Namespace')}</Th>
                <Th>{t('Target')}</Th>
                <Th>{t('Rejected (req/s)')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {policyRows.map((r) => (
                <Tr key={`${r.ns}/${r.name}`}>
                  <Td>
                    <Link to={`/connectivity-link/policies/ratelimit/${r.ns}/${r.name}`}>
                      {r.name}
                    </Link>
                  </Td>
                  <Td>{r.ns}</Td>
                  <Td>{r.target}</Td>
                  <Td>{r.rate.toFixed(3)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Saturated consumers — current rate relative to the cluster's busiest
// consumer. This is a *proxy* for saturation rather than absolute "% of
// plan limit" (Prometheus doesn't carry per-consumer plan limits as labels,
// so we'd need to join against PlanPolicy specs to compute the real %).
// The proxy still answers "who is right at the top of the usage table?".
// ---------------------------------------------------------------------------

function SaturatedConsumersCard() {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { rows, loaded } = useInstantTopK(PER_CONSUMER_CURRENT_RATE(10));
  const max = rows[0]?.value ?? 0;

  return (
    <Card isCompact isFullHeight>
      <CardTitle>
        {t('Saturated consumers')}{' '}
        <span style={{ fontWeight: 400, color: 'var(--pf-v5-global--Color--300)' }}>
          ({t('current 5m')})
        </span>
      </CardTitle>
      <CardBody>
        {!loaded ? (
          <Bullseye style={{ minHeight: 120 }}>
            <Spinner size="md" />
          </Bullseye>
        ) : rows.length === 0 ? (
          <Empty>{t('No identified consumer traffic in the last 5 minutes.')}</Empty>
        ) : (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
            {rows.map((b) => {
              const pct = max > 0 ? Math.round((b.value / max) * 100) : 0;
              const tone = saturationTone(pct);
              return (
                <FlexItem key={b.key}>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem style={{ minWidth: 160 }}>
                      <code style={{ fontSize: 12 }}>{b.key}</code>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }}>
                      <Progress
                        value={pct}
                        title=""
                        label={`${pct}% ${t('of leader')}`}
                        valueText={`${pct}%`}
                        size={ProgressSize.sm}
                      />
                    </FlexItem>
                    <FlexItem>
                      <Label color={tone.color} isCompact>
                        {tone.label}
                      </Label>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              );
            })}
            <FlexItem>
              <p style={{ fontSize: 11, color: 'var(--pf-v5-global--Color--300)' }}>
                {t('Relative to the busiest consumer in the window — not an absolute % of plan limit (plan ceilings live in PlanPolicy, not in metric labels).')}
              </p>
            </FlexItem>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--pf-v5-global--Color--200)',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      {children}
    </div>
  );
}

export default RateLimitAnalyticsPage;
