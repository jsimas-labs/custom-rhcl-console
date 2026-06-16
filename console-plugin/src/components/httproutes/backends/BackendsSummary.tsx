import * as React from 'react';
import {
  Card, CardBody, CardTitle, Flex, FlexItem, Grid, GridItem, Title, Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../types/httproute';
import { usePrometheusTraffic } from '../../../hooks/usePrometheusTraffic';
import { usePrometheusRange } from '../../../hooks/usePrometheusRange';
import {
  trafficOverTimeQuery,
  statusCodeRateRangeQuery,
} from '../../../utils/prometheusQueries';
import { derivedStatusFor } from './utils/backendDerivedStatus';
import { DedupedBackend } from './utils/dedupeBackends';

interface Props {
  backends: DedupedBackend[];
  route: HTTPRoute | undefined;
}

/**
 * Six-card horizontal strip. Three counts (Total / Healthy / Warning / Errors)
 * answer "what's the state right now"; two metric cards (Requests · Error rate)
 * with sparklines answer "is it trending well".
 *
 * Cards are intentionally tight (no body text, no descriptions) — the title is
 * the label, the number is the answer. If the operator wants depth, the
 * Metrics tab and the row drawer have it.
 */
export const BackendsSummary: React.FC<Props> = ({ backends, route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  // ── Counts derived from the backend list (cheap, no Prom call) ────────────
  const counts = React.useMemo(() => {
    const acc = { total: backends.length, ok: 0, warn: 0, bad: 0 };
    for (const b of backends) {
      const s = derivedStatusFor(b).status;
      if (s === 'ok')   acc.ok++;
      else if (s === 'warn') acc.warn++;
      else acc.bad++;
    }
    return acc;
  }, [backends]);

  // ── Live traffic + error rate at the *route* level (one call, not per-row)
  // We use the route-level numbers because the summary is about the whole
  // route. The drawer's Metrics tab can drill down per backend.
  const ns = route?.metadata?.namespace ?? '';
  const nm = route?.metadata?.name ?? '';
  const { data, loaded: trafficLoaded, metricsAvailable } = usePrometheusTraffic(
    'HTTPRoute', nm, ns, 60000, '5m',
  );

  // ── Sparklines (range queries — 1h × 60s steps) ───────────────────────────
  // Two series each: the request-rate sparkline plots req/s over the hour,
  // the error-rate one plots 5xx rate over the hour. Empty arrays when ns/nm
  // not ready or Prom unreachable; <Sparkline> handles empty gracefully.
  const rangeQueries = ns && nm ? [
    { label: 'rate',  query: trafficOverTimeQuery(ns, nm, 'HTTPRoute', '1m') },
    { label: 'err5x', query: statusCodeRateRangeQuery(ns, nm, 'HTTPRoute', '5xx', '1m') },
  ] : [];
  const { series } = usePrometheusRange(rangeQueries, 3600, 60);
  const rateSparkline = series.find((s) => s.label === 'rate')?.data ?? [];
  const errSparkline  = series.find((s) => s.label === 'err5x')?.data ?? [];

  // ── Formatting ────────────────────────────────────────────────────────────
  // Requests (5m): we have the *rate* (req/s); convert to a 5-minute count.
  // The PromQL window is already 5m, so rate × 300 ≈ requests in that window.
  const reqsIn5m = data.requestRate5m !== null ? data.requestRate5m * 300 : null;
  const errPct =
    data.successRate !== null ? Math.max(0, 100 - data.successRate) : null;

  return (
    <Grid hasGutter style={{ marginBottom: 16 }}>
      <KpiCard
        label={t('Total backends')}
        value={String(counts.total)}
      />
      <KpiCard
        label={t('Healthy')}
        value={String(counts.ok)}
        icon={<CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />}
      />
      <KpiCard
        label={t('Warning')}
        value={String(counts.warn)}
        icon={<ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />}
      />
      <KpiCard
        label={t('Errors')}
        value={String(counts.bad)}
        icon={<ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" />}
      />
      <KpiCard
        label={t('Requests (5m)')}
        value={
          !trafficLoaded || !metricsAvailable ? '—'
          : reqsIn5m === null ? '—'
          : humanizeCount(reqsIn5m)
        }
        sparkline={rateSparkline}
        sparklineColor="var(--pf-t--global--icon--color--status--info--default)"
        tooltip={t('Approximate request count over the last 5 minutes (rate × 300s)')}
      />
      <KpiCard
        label={t('Error rate (5m)')}
        value={
          !trafficLoaded || !metricsAvailable ? '—'
          : errPct === null ? '—'
          : `${errPct.toFixed(2)}%`
        }
        sparkline={errSparkline}
        sparklineColor="var(--pf-t--global--icon--color--status--danger--default)"
        tooltip={t('Share of 4xx + 5xx responses, last 5 minutes')}
      />
    </Grid>
  );
};

// ── KpiCard helper ──────────────────────────────────────────────────────────
// One micro-card. Title small, value big, optional icon left of title,
// optional sparkline below value. The sparkline is intentionally ~28px
// tall — at this size it reads as a *trend mark*, not a chart, which is
// exactly what we want next to a big number.
interface KpiCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sparkline?: { x: Date; y: number }[];
  sparklineColor?: string;
  tooltip?: string;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, sparkline, sparklineColor, tooltip }) => {
  const titleNode = (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      {icon && <FlexItem>{icon}</FlexItem>}
      <FlexItem style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
        {label}
      </FlexItem>
    </Flex>
  );
  return (
    <GridItem span={2}>
      <Card isCompact isFullHeight>
        <CardTitle>
          {tooltip ? <Tooltip content={tooltip}>{titleNode}</Tooltip> : titleNode}
        </CardTitle>
        <CardBody>
          <Title headingLevel="h2" size="xl">{value}</Title>
          {sparkline && sparkline.length > 1 && (
            <MiniSparkline data={sparkline} color={sparklineColor ?? 'currentColor'} />
          )}
        </CardBody>
      </Card>
    </GridItem>
  );
};

// Pure SVG sparkline — avoids pulling Victory just for a 28px polyline.
// Victory is heavy enough that loading it for the summary strip would
// noticeably slow first paint on the Backends tab; this hand-rolled
// version is ~30 lines and renders instantly.
const MiniSparkline: React.FC<{ data: { x: Date; y: number }[]; color: string }> = ({ data, color }) => {
  const W = 120, H = 28, P = 1; // padding so the stroke doesn't clip
  const ys = data.map((p) => p.y);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yRange = yMax - yMin || 1;
  const stepX = (W - P * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((p, i) => {
      const x = P + i * stepX;
      const y = H - P - ((p.y - yMin) / yRange) * (H - P * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ marginTop: 6, display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

function humanizeCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}
