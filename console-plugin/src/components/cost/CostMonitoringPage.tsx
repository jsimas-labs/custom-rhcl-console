import * as React from 'react';
import {
  PageSection,
  Title,
  Spinner,
  Bullseye,
  Label,
  EmptyState,
  EmptyStateBody,
  Card,
  CardBody,
  Gallery,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Button,
  Tooltip,
  Progress,
  ProgressSize,
  ProgressMeasureLocation,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  ExternalLinkAltIcon,
  SyncAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ChartLineIcon,
  CubesIcon,
  UsersIcon,
  WalletIcon,
  LockIcon,
  RouteIcon,
  ListIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  useCostByConsumer,
  CostRow,
  InsightTone,
  WhatChangedItem,
  Recommendation,
  DashboardKey,
} from '../../hooks/useCostByConsumer';
import { useGrafanaLink, GrafanaDashboard } from '../../utils/grafana';
import { CostPricing } from '../../utils/pluginConfig';
import './cost-monitoring.css';

/**
 * Cost Monitoring v2 — operational decision dashboard.
 *
 * Six-section layout designed to answer "how much / why / who / should
 * I worry / what next / where to dig" in under 5 seconds:
 *
 *   1. Cost summary           — 5 hero KPIs
 *   2. What changed?          — cost-movement attribution
 *   3. Top consumers          — ranked who-paid table
 *   4. Cost breakdown         — donut + per-driver bars
 *   5. Budget                 — radial ring + projected month-end
 *   6. Recommendations        — action-oriented cards with CTAs
 *   7. Explore in Grafana     — deep links to the 5 dashboards
 *
 * Sections 2-5 sit in two 2-column rows so the page reads on a single
 * laptop screen. PatternFly Card primitives are scoped under the
 * `rhcl-cost-root` wrapper, which gives them the glass treatment from
 * `cost-monitoring.css`.
 */

// PatternFly Label doesn't ship a "gold" colour token, so map the
// gold plan to `yellow` which renders the closest visual match.
const tierColor: Record<string, 'yellow' | 'grey' | 'orange' | 'blue' | 'red'> = {
  gold: 'yellow',
  silver: 'grey',
  bronze: 'orange',
  anonymous: 'blue',
  unknown: 'red',
};

const toneColor: Record<InsightTone, string> = {
  positive: 'var(--pf-t--global--color--status--success--default)',
  warning: 'var(--pf-t--global--color--status--warning--default)',
  neutral: 'var(--pf-t--global--color--status--info--default)',
};

// Icon palette by iconKey — keeps the page composition declarative.
const iconFor = {
  tokens: <CubesIcon />,
  consumer: <UsersIcon />,
  route: <RouteIcon />,
  breakdown: <ListIcon />,
  auth: <LockIcon />,
  check: <CheckCircleIcon />,
};

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return formatNumber(n);
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** ↑ +12.6% in red (cost up) / ↓ -3.2% in green (cost down). */
const Delta: React.FC<{ pct: number | null; invert?: boolean; suffix?: string }> = ({
  pct,
  invert,
  suffix,
}) => {
  if (pct == null) return <span style={{ color: 'var(--rhcl-text-subtle)' }}>—</span>;
  const rounded = Math.round(pct * 10) / 10;
  const up = rounded > 0;
  const down = rounded < 0;
  const positive = invert ? up : down;
  const color = positive
    ? 'var(--pf-t--global--color--status--success--default)'
    : up || down
    ? 'var(--pf-t--global--color--status--danger--default)'
    : 'var(--rhcl-text-subtle)';
  return (
    <span style={{ color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {up ? <ArrowUpIcon /> : down ? <ArrowDownIcon /> : null}
      {' '}
      {`${up ? '+' : ''}${rounded.toFixed(1)}%${suffix ? ` ${suffix}` : ''}`}
    </span>
  );
};

/**
 * Sparkline with filled area + last-point highlight. The line + fill
 * inherit `--rhcl-accent-from` from the parent KPI variant, and the
 * trailing dot picks up the same colour at a touch higher opacity so
 * the eye lands on "this is where the period ends".
 */
const Sparkline: React.FC<{ data: number[]; height?: number }> = ({ data, height = 36 }) => {
  if (data.length < 2) return <div style={{ height }} />;
  const w = 100;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y] as [number, number];
  });
  // Smooth path via Catmull-Rom-ish quadratic — interpolates each
  // segment using the midpoint between consecutive points so the line
  // reads as a curve without overshooting like a cubic Bezier.
  const path = (() => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
      d += ` T ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  })();
  const fillPath = `${path} L ${w} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}
      aria-hidden="true"
    >
      <path className="rhcl-sparkline-fill" d={fillPath} />
      <path className="rhcl-sparkline-stroke" d={path} />
      <circle cx={last[0]} cy={last[1]} r={2.5} className="rhcl-sparkline-tip" />
    </svg>
  );
};

/** SVG donut with N segments + centre label. Keeps zero dependencies. */
const Donut: React.FC<{
  segments: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerTop?: React.ReactNode;
  centerBottom?: React.ReactNode;
}> = ({ segments, size = 160, stroke = 22, centerTop, centerBottom }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const seg = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--pf-t--global--text--color--regular)' }}>
            {centerTop}
          </div>
          {centerBottom && (
            <div style={{ fontSize: 11, color: 'var(--rhcl-text-subtle)' }}>
              {centerBottom}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Radial progress ring (used by the Budget card). */
const RadialRing: React.FC<{
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: React.ReactNode;
}> = ({ value, size = 140, stroke = 12, color = 'var(--pf-t--global--color--status--success--default)', label }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const off = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );
};

type KpiVariant = 'cost' | 'requests' | 'tokens' | 'consumer' | 'budget';

/** Hero KPI card — variant drives the accent palette via CSS. */
const KpiCard: React.FC<{
  variant: KpiVariant;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  delta?: React.ReactNode;
  sparkline?: number[];
  tooltip?: string;
}> = ({ variant, icon, label, value, subtitle, delta, sparkline, tooltip }) => (
  <Card isCompact isPlain className={`rhcl-kpi-card rhcl-kpi--${variant}`}>
    <CardBody>
      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <div className="rhcl-icon-badge">{icon}</div>
        </FlexItem>
        <FlexItem>
          <div className="rhcl-kpi-label">
            {label}
            {tooltip && (
              <Tooltip content={tooltip}>
                <InfoCircleIcon style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.6 }} />
              </Tooltip>
            )}
          </div>
        </FlexItem>
      </Flex>
      <div className="rhcl-kpi-value">{value}</div>
      {delta && <div style={{ marginTop: 4 }}>{delta}</div>}
      {subtitle && <div className="rhcl-kpi-subtitle">{subtitle}</div>}
      {sparkline && sparkline.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Sparkline data={sparkline} />
        </div>
      )}
    </CardBody>
  </Card>
);

/** Row inside the "What changed?" card. */
const WhatChangedRow: React.FC<{
  item: WhatChangedItem;
  url: (k: DashboardKey) => string | null;
}> = ({ item, url }) => {
  const href = item.cta ? url(item.cta.dashboard) : null;
  return (
    <div className="rhcl-wc-row">
      <div
        className="rhcl-icon-badge rhcl-icon-badge--md"
        style={item.tone === 'positive' ? ({ '--rhcl-accent-from': toneColor.positive, '--rhcl-accent-soft': 'rgba(62,134,53,0.18)' } as React.CSSProperties) : undefined}
      >
        {iconFor[item.iconKey]}
      </div>
      <div className="rhcl-wc-body">
        <div className="rhcl-wc-title">{item.title}</div>
        <div className="rhcl-wc-detail">{item.detail}</div>
      </div>
      {item.cta && href ? (
        <a className="rhcl-wc-cta" href={href} target="_blank" rel="noreferrer">
          {item.cta.label} <ArrowRightIcon style={{ fontSize: 11, verticalAlign: 'middle' }} />
        </a>
      ) : item.cta ? (
        <span className="rhcl-wc-cta rhcl-wc-cta--disabled">{item.cta.label}</span>
      ) : null}
    </div>
  );
};

/** Card in the Recommendations grid. */
const RecommendationCard: React.FC<{
  rec: Recommendation;
  url: (k: DashboardKey) => string | null;
  t: (s: string) => string;
}> = ({ rec, url, t }) => {
  const href = rec.cta ? url(rec.cta.dashboard) : null;
  const Icon =
    rec.tone === 'positive'
      ? CheckCircleIcon
      : rec.tone === 'warning'
      ? ExclamationTriangleIcon
      : InfoCircleIcon;
  return (
    <Card isCompact isPlain className={`rhcl-insight-card rhcl-insight--${rec.tone}`}>
      <CardBody>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <Icon style={{ color: toneColor[rec.tone], fontSize: 18 }} />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>{rec.title}</div>
            <div style={{ fontSize: 12, color: 'var(--rhcl-text-subtle)', marginTop: 4, lineHeight: 1.4 }}>
              {rec.detail}
            </div>
            <div style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--regular)', marginTop: 6, lineHeight: 1.4 }}>
              {t(rec.recommendation)}
            </div>
            {rec.cta && href && (
              <a className="rhcl-insight-cta" href={href} target="_blank" rel="noreferrer">
                {t(rec.cta.label)} <ArrowRightIcon style={{ fontSize: 11, verticalAlign: 'middle' }} />
              </a>
            )}
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

const GrafanaLinkCard: React.FC<{
  dashboard: GrafanaDashboard;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: KpiVariant;
}> = ({ dashboard, title, subtitle, icon, variant }) => {
  const { url, available } = useGrafanaLink(dashboard);
  const cardClass = `rhcl-grafana-card${available ? '' : ' rhcl-grafana-card--disabled'}`;
  const content = (
    <Card isCompact isPlain className={cardClass}>
      <CardBody>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <div className={`rhcl-icon-badge rhcl-kpi--${variant}`}>{icon}</div>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--rhcl-text-subtle)', marginTop: 2 }}>
              {subtitle}
            </div>
          </FlexItem>
          <FlexItem>
            <ExternalLinkAltIcon
              style={{ color: available ? 'var(--pf-t--global--color--brand--default)' : 'var(--rhcl-text-subtle)' }}
            />
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
  return available && url ? (
    <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </a>
  ) : (
    <Tooltip content="Grafana dashboard not available on this cluster">
      <div>{content}</div>
    </Tooltip>
  );
};

const CostMonitoringPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const {
    rows,
    loaded,
    hasPricing,
    pricing,
    currency,
    totals,
    drivers,
    topConsumer,
    topConsumerSharePct,
    sparklines,
    expectedCost,
    whatChanged,
    recommendations,
    budget,
    periodLabel,
  } = useCostByConsumer();

  // Resolve dashboard URLs once so the children just look up by key.
  const costsLink = useGrafanaLink('api-costs');
  const consumersLink = useGrafanaLink('api-consumers');
  const overviewLink = useGrafanaLink('api-overview');
  const dashboardUrl = React.useCallback(
    (k: DashboardKey): string | null => {
      switch (k) {
        case 'api-costs':
          return costsLink.url;
        case 'api-consumers':
          return consumersLink.url;
        case 'api-overview':
          return overviewLink.url;
      }
    },
    [costsLink.url, consumersLink.url, overviewLink.url],
  );

  const [refreshKey, setRefreshKey] = React.useState(0);

  // Preserve `.rhcl-plugin-root` on the loading path — same fix pattern
  // as the other top-level plugin pages so the surface stays dark-gray
  // instead of flashing pure black between navigation and data arrival.
  if (!loaded) {
    return (
      <div className="rhcl-plugin-root">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Cost Monitoring')}</Title>
        </PageSection>
        <PageSection>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </PageSection>
      </div>
    );
  }

  const subtitle = hasPricing
    ? t('Estimated API gateway costs based on requests, AI token usage and configured pricing.')
    : t('Per-consumer usage over the last 24 hours. Set `costPricing` in the plugin ConfigMap to see monetary values.');

  // Budget projection — extend 24h spend linearly across the calendar
  // month. Coarse on purpose; the Grafana dashboard does the precise
  // math when the operator clicks through.
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthEndCost = totals.cost * daysInMonth;
  const budgetSharePct =
    budget != null && budget > 0 ? Math.min(100, (projectedMonthEndCost / budget) * 100) : 0;
  const budgetRemaining = budget != null ? Math.max(0, budget - projectedMonthEndCost) : 0;

  // Expected-cost label on the Estimated Cost KPI.
  const expectedLabel = (() => {
    if (!expectedCost || totals.cost === 0) return null;
    if (totals.cost > expectedCost.max) return { tone: 'warning' as const, text: 'Higher than expected' };
    if (totals.cost < expectedCost.min) return { tone: 'positive' as const, text: 'Lower than expected' };
    return { tone: 'positive' as const, text: 'Within expected range' };
  })();

  // Donut data for the Cost breakdown section.
  const donutSegments = [
    { label: 'Requests', value: drivers.find((d) => d.key === 'calls')?.cost ?? 0, color: '#9c6bff' },
    { label: 'AI Tokens', value: drivers.find((d) => d.key === 'tokens')?.cost ?? 0, color: '#2dd4bf' },
  ].filter((s) => s.value > 0);

  return (
    <div key={refreshKey} className="rhcl-cost-root">
      {/* ---------- Header ---------- */}
      <PageSection variant="default" className="rhcl-page-header">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" style={{ display: 'flex', alignItems: 'center' }}>
              {t('Cost Monitoring')}
              <span className="rhcl-beta-badge">{t('Beta')}</span>
            </Title>
            <div style={{ marginTop: 6, fontSize: 14, color: 'var(--rhcl-text-subtle)' }}>
              {subtitle}
            </div>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Label isCompact color="grey">
                  {t(periodLabel)}
                </Label>
              </FlexItem>
              <FlexItem>
                <Button variant="secondary" icon={<SyncAltIcon />} onClick={() => setRefreshKey((k) => k + 1)}>
                  {t('Refresh')}
                </Button>
              </FlexItem>
              {costsLink.available && costsLink.url && (
                <FlexItem>
                  <Button
                    variant="primary"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="right"
                    component="a"
                    href={costsLink.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('Open Grafana Dashboard')}
                  </Button>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* ---------- §1 Cost summary ---------- */}
      <PageSection className="rhcl-page-section">
        <div className="rhcl-section-title rhcl-section-title-h2">{t('Cost summary')}</div>
        <Gallery hasGutter minWidths={{ default: '210px' }}>
          <KpiCard
            variant="cost"
            icon={<WalletIcon />}
            label={t('Estimated Cost')}
            value={
              hasPricing
                ? formatCurrency(totals.cost, currency)
                : `${formatCompact(totals.calls)} ${t('calls')}`
            }
            delta={hasPricing ? <Delta pct={totals.costDeltaPct} /> : null}
            subtitle={
              expectedLabel && hasPricing ? (
                <span style={{ color: toneColor[expectedLabel.tone] }}>
                  {t(expectedLabel.text)}
                  {expectedCost && (
                    <span style={{ color: 'var(--rhcl-text-subtle)', fontWeight: 400 }}>
                      {' '}
                      · {t('Expected')} {formatCurrency(expectedCost.min, currency)}–
                      {formatCurrency(expectedCost.max, currency)}
                    </span>
                  )}
                </span>
              ) : null
            }
            sparkline={sparklines.cost}
          />
          <KpiCard
            variant="requests"
            icon={<ChartLineIcon />}
            label={t('Requests')}
            value={formatCompact(totals.calls)}
            delta={<Delta pct={totals.callsDeltaPct} />}
            sparkline={sparklines.calls}
          />
          <KpiCard
            variant="tokens"
            icon={<CubesIcon />}
            label={t('AI Tokens')}
            value={formatCompact(totals.tokens)}
            delta={<Delta pct={totals.tokensDeltaPct} />}
            sparkline={sparklines.tokens}
          />
          <KpiCard
            variant="consumer"
            icon={<UsersIcon />}
            label={t('Top Consumer')}
            value={
              topConsumer ? (
                <span title={topConsumer.consumerLabel} style={{ fontSize: 18 }}>
                  {topConsumer.consumerLabel.split('·')[0].trim()}
                </span>
              ) : (
                '—'
              )
            }
            subtitle={
              topConsumer ? (
                <span>
                  <span style={{ color: 'var(--pf-t--global--color--status--success--default)', fontWeight: 700 }}>
                    {topConsumerSharePct.toFixed(0)}%
                  </span>{' '}
                  {t('of total cost')}
                </span>
              ) : null
            }
          />
          {budget != null && hasPricing && (
            <KpiCard
              variant="budget"
              icon={<WalletIcon />}
              label={t('Budget Usage')}
              value={`${budgetSharePct.toFixed(0)}%`}
              subtitle={
                <span>
                  {t('of')} {formatCurrency(budget, currency)} {t('budget')}
                </span>
              }
            />
          )}
        </Gallery>
      </PageSection>

      {/* ---------- §2 What changed? + §3 Top consumers ---------- */}
      <PageSection className="rhcl-page-section">
        <Grid hasGutter>
          <GridItem md={12} lg={7}>
            <WhatChangedCard items={whatChanged} url={dashboardUrl} t={t} />
          </GridItem>
          <GridItem md={12} lg={5}>
            <TopConsumersCard
              rows={rows}
              totalCost={totals.cost}
              totalCalls={totals.calls}
              hasPricing={hasPricing}
              currency={currency}
              grafanaUrl={consumersLink.url}
              t={t}
            />
          </GridItem>
        </Grid>
      </PageSection>

      {/* ---------- §4 Cost breakdown + §5 Budget ---------- */}
      <PageSection className="rhcl-page-section">
        <Grid hasGutter>
          <GridItem md={12} lg={7}>
            <CostBreakdownCard
              drivers={drivers}
              currency={currency}
              hasPricing={hasPricing}
              donutSegments={donutSegments}
              totalCost={totals.cost}
              grafanaUrl={costsLink.url}
              t={t}
            />
          </GridItem>
          <GridItem md={12} lg={5}>
            <BudgetCard
              budget={budget}
              budgetSharePct={budgetSharePct}
              budgetRemaining={budgetRemaining}
              projectedMonthEndCost={projectedMonthEndCost}
              currency={currency}
              grafanaUrl={costsLink.url}
              t={t}
            />
          </GridItem>
        </Grid>
      </PageSection>

      {/* ---------- §6 How costs are calculated ---------- */}
      {hasPricing && (
        <PageSection className="rhcl-page-section">
          <CostConfigCard pricing={pricing} currency={currency} budget={budget} t={t} />
        </PageSection>
      )}

      {/* ---------- §7 Recommendations ---------- */}
      {recommendations.length > 0 && (
        <PageSection className="rhcl-page-section">
          <div className="rhcl-section-title rhcl-section-title-h2">
            {t('Recommendations')}
            <Tooltip content={t('Action-oriented signals derived from the same data the cards above show.')}>
              <InfoCircleIcon style={{ verticalAlign: 'middle', opacity: 0.6, fontSize: 14 }} />
            </Tooltip>
          </div>
          <Gallery hasGutter minWidths={{ default: '260px' }}>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} url={dashboardUrl} t={t} />
            ))}
          </Gallery>
        </PageSection>
      )}

      {/* ---------- §8 Explore in Grafana ---------- */}
      <PageSection className="rhcl-page-section">
        <div className="rhcl-section-title rhcl-section-title-h2">{t('Explore in Grafana')}</div>
        <div style={{ color: 'var(--rhcl-text-subtle)', fontSize: 13, marginBottom: 12 }}>
          {t('Deep dive into your cost and usage metrics with pre-built dashboards.')}
        </div>
        <Gallery hasGutter minWidths={{ default: '200px' }}>
          <GrafanaLinkCard
            variant="cost"
            dashboard="api-costs"
            title={t('Cost Dashboard')}
            subtitle={t('Detailed cost breakdown and trends')}
            icon={<WalletIcon />}
          />
          <GrafanaLinkCard
            variant="consumer"
            dashboard="api-consumers"
            title={t('Consumer Dashboard')}
            subtitle={t('Per-consumer usage and cost')}
            icon={<UsersIcon />}
          />
          <GrafanaLinkCard
            variant="tokens"
            dashboard="api-costs"
            title={t('AI Dashboard')}
            subtitle={t('Token usage and prompt costs')}
            icon={<CubesIcon />}
          />
          <GrafanaLinkCard
            variant="requests"
            dashboard="api-overview"
            title={t('Routes Dashboard')}
            subtitle={t('Per-route traffic and latency')}
            icon={<RouteIcon />}
          />
          <GrafanaLinkCard
            variant="requests"
            dashboard="api-overview"
            title={t('Traffic Dashboard')}
            subtitle={t('Gateway-level traffic patterns')}
            icon={<ChartLineIcon />}
          />
        </Gallery>
      </PageSection>

      {rows.length === 0 && (
        <PageSection>
          <EmptyState headingLevel="h3" titleText={t('No cost data yet')}>
            <EmptyStateBody>
              {t('Generate traffic with tests/simulate-api-traffic.sh and wait ~60s for the first poll.')}
            </EmptyStateBody>
          </EmptyState>
        </PageSection>
      )}
    </div>
  );
};

// -------------------------------------------------------------------

const WhatChangedCard: React.FC<{
  items: WhatChangedItem[];
  url: (k: DashboardKey) => string | null;
  t: (s: string) => string;
}> = ({ items, url, t }) => (
  <Card isPlain className="rhcl-section-card" style={{ height: '100%' }}>
    <CardBody>
      <div className="rhcl-section-title">
        {t('What changed?')}
        <Tooltip content={t('Auto-derived attribution behind the period’s cost movement.')}>
          <InfoCircleIcon style={{ verticalAlign: 'middle', opacity: 0.6, fontSize: 14 }} />
        </Tooltip>
      </div>
      {items.length === 0 ? (
        <div className="rhcl-wc-row">
          <div
            className="rhcl-icon-badge rhcl-icon-badge--md"
            style={
              { '--rhcl-accent-from': toneColor.positive, '--rhcl-accent-soft': 'rgba(62,134,53,0.18)' } as React.CSSProperties
            }
          >
            <CheckCircleIcon />
          </div>
          <div className="rhcl-wc-body">
            <div className="rhcl-wc-title">{t('No anomalies detected')}</div>
            <div className="rhcl-wc-detail">
              {t('Cost and usage are within expected ranges for the period.')}
            </div>
          </div>
        </div>
      ) : (
        items.map((item) => <WhatChangedRow key={item.id} item={item} url={url} />)
      )}
    </CardBody>
  </Card>
);

const TopConsumersCard: React.FC<{
  rows: CostRow[];
  totalCost: number;
  totalCalls: number;
  hasPricing: boolean;
  currency: string;
  grafanaUrl: string | null;
  t: (s: string) => string;
}> = ({ rows, totalCost, totalCalls, hasPricing, currency, grafanaUrl, t }) => (
  <Card isPlain className="rhcl-section-card" style={{ height: '100%' }}>
    <CardBody>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <div className="rhcl-section-title" style={{ marginBottom: 0 }}>
            {t('Top consumers')}
          </div>
        </FlexItem>
        {grafanaUrl && (
          <FlexItem>
            <a href={grafanaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600 }}>
              {t('View all in Grafana')} <ExternalLinkAltIcon style={{ fontSize: 11 }} />
            </a>
          </FlexItem>
        )}
      </Flex>
      {rows.length === 0 ? (
        <div
          style={{ marginTop: 14, color: 'var(--rhcl-text-subtle)', fontSize: 13 }}
        >
          {t('No consumer activity recorded yet.')}
        </div>
      ) : (
        <Table aria-label={t('Top consumers')} variant="compact" borders={false} style={{ marginTop: 8 }}>
          <Thead>
            <Tr>
              <Th style={{ width: 24 }}>#</Th>
              <Th>{t('Consumer')}</Th>
              <Th>{t('Plan')}</Th>
              {hasPricing && <Th>{t('Est. Cost')}</Th>}
              <Th>{t('% of total')}</Th>
              <Th>{t('Trend')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.slice(0, 5).map((r, i) => {
              const share = hasPricing
                ? totalCost > 0 && r.cost != null
                  ? (r.cost / totalCost) * 100
                  : 0
                : totalCalls > 0
                ? (r.calls / totalCalls) * 100
                : 0;
              return (
                <Tr key={r.consumerId}>
                  <Td style={{ color: 'var(--rhcl-text-subtle)' }}>{i + 1}</Td>
                  <Td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.consumerLabel}</div>
                  </Td>
                  <Td>
                    <Label color={tierColor[r.tier] || 'grey'} isCompact>
                      {r.tier}
                    </Label>
                  </Td>
                  {hasPricing && <Td>{r.cost != null ? formatCurrency(r.cost, currency) : '—'}</Td>}
                  <Td>
                    <div style={{ minWidth: 90 }}>
                      <Progress
                        value={share}
                        measureLocation={ProgressMeasureLocation.outside}
                        size={ProgressSize.sm}
                        title=""
                        label={`${share.toFixed(1)}%`}
                        aria-label={`${r.consumerLabel} share`}
                      />
                    </div>
                  </Td>
                  <Td>
                    <Delta pct={r.deltaPct} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </CardBody>
  </Card>
);

const CostBreakdownCard: React.FC<{
  drivers: { key: string; label: string; cost: number; sharePct: number }[];
  currency: string;
  hasPricing: boolean;
  donutSegments: { label: string; value: number; color: string }[];
  totalCost: number;
  grafanaUrl: string | null;
  t: (s: string) => string;
}> = ({ drivers, currency, hasPricing, donutSegments, totalCost, grafanaUrl, t }) => (
  <Card isPlain className="rhcl-section-card" style={{ height: '100%' }}>
    <CardBody>
      <div className="rhcl-section-title">{t('Cost breakdown')}</div>
      {!hasPricing || totalCost === 0 ? (
        <div style={{ color: 'var(--rhcl-text-subtle)', fontSize: 13 }}>
          {t('No driver data yet — generate traffic to populate the breakdown.')}
        </div>
      ) : (
        <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Donut
              segments={donutSegments}
              centerTop={formatCurrency(totalCost, currency)}
              centerBottom={t('Total')}
            />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div style={{ minWidth: 220 }}>
              {drivers.map((d, i) => (
                <div key={d.key} className="rhcl-driver-row" style={{ paddingTop: i === 0 ? 0 : 12 }}>
                  <Flex
                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <FlexItem>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background:
                              d.key === 'tokens' ? '#2dd4bf' : '#9c6bff',
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{t(d.label)}</span>
                      </div>
                    </FlexItem>
                    <FlexItem>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(d.cost, currency)}</span>{' '}
                      <span style={{ color: 'var(--rhcl-text-subtle)', fontSize: 12 }}>
                        {d.sharePct.toFixed(1)}%
                      </span>
                    </FlexItem>
                  </Flex>
                  <div style={{ marginTop: 6 }}>
                    <Progress value={d.sharePct} measureLocation={ProgressMeasureLocation.none} size={ProgressSize.sm} aria-label={`${d.label} share`} />
                  </div>
                </div>
              ))}
            </div>
          </FlexItem>
        </Flex>
      )}
      {grafanaUrl && (
        <div style={{ marginTop: 14 }}>
          <a href={grafanaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600 }}>
            {t('View detailed breakdown in Grafana')} <ExternalLinkAltIcon style={{ fontSize: 11 }} />
          </a>
        </div>
      )}
    </CardBody>
  </Card>
);

/**
 * "How costs are calculated" — a reference card that surfaces the exact
 * per-tier rates from the plugin ConfigMap plus the formula the cost
 * math applies, so a viewer can reconcile any number on this page by
 * hand (and see which raw metric each driver comes from). Same source
 * of truth the KPIs above are computed from — nothing is re-derived.
 */
const CostConfigCard: React.FC<{
  pricing: CostPricing;
  currency: string;
  budget: number | null;
  t: (s: string) => string;
}> = ({ pricing, currency, budget, t }) => {
  const tiers = Object.entries(pricing).sort(([a], [b]) => a.localeCompare(b));
  return (
    <Card isPlain className="rhcl-section-card">
      <CardBody>
        <div className="rhcl-section-title rhcl-section-title-h2">
          {t('How costs are calculated')}
          <Tooltip
            content={t(
              'The per-tier rates and formula the plugin applies to raw usage — the same source of truth the numbers above are computed from.',
            )}
          >
            <InfoCircleIcon style={{ verticalAlign: 'middle', opacity: 0.6, fontSize: 14, marginLeft: 6 }} />
          </Tooltip>
        </div>
        <Grid hasGutter>
          {/* Per-tier rate table */}
          <GridItem md={12} lg={7}>
            <Table aria-label={t('Cost pricing tiers')} variant="compact" borders={false}>
              <Thead>
                <Tr>
                  <Th>{t('Plan')}</Th>
                  <Th>{t('Per 1K calls')}</Th>
                  <Th>{t('Per 1K tokens')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tiers.map(([tier, v]) => (
                  <Tr key={tier}>
                    <Td>
                      <Label color={tierColor[tier] || 'grey'} isCompact>
                        {tier}
                      </Label>
                    </Td>
                    <Td>{formatCurrency(v.calls_per_1k, currency)}</Td>
                    <Td>{formatCurrency(v.tokens_per_1k, currency)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </GridItem>

          {/* Formula + metric provenance */}
          <GridItem md={12} lg={5}>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <code
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--pf-t--global--text--color--regular)',
                }}
              >
                cost = (calls ÷ 1000) × rate<sub>calls</sub>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (tokens ÷ 1000) × rate<sub>tokens</sub>
              </code>
              <div style={{ marginTop: 10, color: 'var(--rhcl-text-subtle)' }}>
                {t('Computed per consumer at its plan-tier rate, then summed across all consumers.')}
              </div>
              <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--rhcl-text-subtle)', fontSize: 12 }}>
                <li style={{ marginBottom: 4 }}>
                  <strong style={{ color: 'var(--pf-t--global--text--color--regular)' }}>{t('Calls')}</strong> — <code>istio_requests_total</code> · {t('every gateway request')}
                </li>
                <li>
                  <strong style={{ color: 'var(--pf-t--global--text--color--regular)' }}>{t('Tokens')}</strong> — <code>bank_ai_tokens_total</code> · {t('AI prompt + completion')}
                </li>
              </ul>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--rhcl-text-subtle)' }}>
                {t('Currency')}: <strong style={{ color: 'var(--pf-t--global--text--color--regular)' }}>{currency}</strong>
                {budget != null && (
                  <>
                    {' · '}
                    {t('Monthly budget')}:{' '}
                    <strong style={{ color: 'var(--pf-t--global--text--color--regular)' }}>
                      {formatCurrency(budget, currency)}
                    </strong>
                  </>
                )}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--rhcl-text-subtle)', fontStyle: 'italic' }}>
                {t('Rates come from the plugin ConfigMap (costPricing). Edit there to change billing.')}
              </div>
            </div>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

const BudgetCard: React.FC<{
  budget: number | null;
  budgetSharePct: number;
  budgetRemaining: number;
  projectedMonthEndCost: number;
  currency: string;
  grafanaUrl: string | null;
  t: (s: string) => string;
}> = ({ budget, budgetSharePct, budgetRemaining, projectedMonthEndCost, currency, grafanaUrl, t }) => (
  <Card isPlain className="rhcl-section-card" style={{ height: '100%' }}>
    <CardBody>
      <div className="rhcl-section-title">{t('Budget')}</div>
      {budget == null ? (
        <div style={{ color: 'var(--rhcl-text-subtle)', fontSize: 13 }}>
          {t('Set `costBudget` in the plugin ConfigMap to track monthly budget projection.')}
        </div>
      ) : (
        <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <RadialRing
              value={budgetSharePct}
              color={
                budgetSharePct > 90
                  ? toneColor.warning
                  : budgetSharePct > 70
                  ? 'var(--pf-t--global--color--status--info--default)'
                  : toneColor.positive
              }
              label={
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--pf-t--global--text--color--regular)' }}>
                    {budgetSharePct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--rhcl-text-subtle)' }}>
                    {t('used')}
                  </div>
                </div>
              }
            />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div style={{ minWidth: 200 }}>
              <BudgetRow label={t('Monthly budget')} value={formatCurrency(budget, currency)} />
              <BudgetRow label={t('Remaining')} value={formatCurrency(budgetRemaining, currency)} />
              <BudgetRow
                label={t('Projected end-of-month')}
                value={formatCurrency(projectedMonthEndCost, currency)}
              />
            </div>
          </FlexItem>
        </Flex>
      )}
      {grafanaUrl && (
        <div style={{ marginTop: 14 }}>
          <a href={grafanaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600 }}>
            {t('View budget in Grafana')} <ExternalLinkAltIcon style={{ fontSize: 11 }} />
          </a>
        </div>
      )}
    </CardBody>
  </Card>
);

const BudgetRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}
  >
    <span style={{ color: 'var(--rhcl-text-subtle)', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--pf-t--global--text--color--regular)' }}>{value}</span>
  </div>
);

export default CostMonitoringPage;
