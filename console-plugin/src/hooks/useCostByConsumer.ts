import * as React from 'react';
import {
  consoleFetch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { APIKeyGVK } from '../models';
import { APIKey } from '../types';
import { usePollingEffect } from './usePollingEffect';
import {
  CostPricing,
  CostPricingTier,
  parseCostPricing,
  usePluginConfig,
} from '../utils/pluginConfig';

/**
 * One row in the Cost Monitoring table. Captures everything the page
 * renders — the hook does the math here so the component stays a thin
 * table-of-rows view with no PromQL knowledge.
 */
export interface CostRow {
  /** Stable key for React + the table — APIKey Secret name. */
  consumerId: string;
  /** Human-friendly label shown in the row (Secret name + owner). */
  consumerLabel: string;
  /** Plan tier (`gold`, `silver`, `bronze`, …) or `anonymous` / `unknown`. */
  tier: string;
  /** APIProduct the key belongs to, when known. */
  product: string | null;
  /** HTTP calls hitting the gateway from this consumer in the period. */
  calls: number;
  /** Sum of `prompt_tokens + completion_tokens` in the period. */
  tokens: number;
  /** Period cost. `null` when pricing isn't configured. */
  cost: number | null;
  /** Cost contribution from the calls side (informational, drives the Top Cost Drivers card). */
  callsCost: number;
  /** Cost contribution from the AI-tokens side (informational). */
  tokensCost: number;
  /** Cost over the SAME-LENGTH previous period, for the Δ column. */
  previousCost: number | null;
  /** Δ % vs previous period — null when previous == 0 (no comparison). */
  deltaPct: number | null;
}

/** Roll-ups across every row. Drives the KPI strip + insights. */
export interface CostTotals {
  cost: number;
  calls: number;
  tokens: number;
  previousCost: number;
  previousCalls: number;
  previousTokens: number;
  /** Δ % vs previous period — null when previous == 0. */
  costDeltaPct: number | null;
  callsDeltaPct: number | null;
  tokensDeltaPct: number | null;
}

/**
 * Where the spend is coming from. The page renders these as a ranked
 * list with progress bars, so the operator can see "is it tokens or
 * calls?" at a glance without reading the full table.
 */
export interface CostDriver {
  key: 'tokens' | 'calls';
  /** Localised label is the page's responsibility; the hook keeps a
   *  stable english fallback so logging stays useful. */
  label: string;
  cost: number;
  /** 0-100 share of total cost. */
  sharePct: number;
}

export type InsightTone = 'positive' | 'warning' | 'neutral';

/** A bite-sized signal worth flagging on the dashboard. */
export interface CostInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

/**
 * Tied to a specific Grafana dashboard the page deep-links to.
 * Strings rather than the typed `GrafanaDashboard` to avoid a circular
 * import from `utils/grafana` into the hook layer.
 */
export type DashboardKey = 'api-costs' | 'api-consumers' | 'api-overview';

/**
 * An entry in the "What changed?" section — explains a single cause
 * behind the period's cost movement. The CTA is optional: leaving it
 * off renders the row as observational rather than action-oriented.
 */
export interface WhatChangedItem {
  id: string;
  tone: InsightTone;
  iconKey: 'tokens' | 'consumer' | 'route' | 'breakdown' | 'check';
  title: string;
  detail: string;
  cta?: { label: string; dashboard: DashboardKey };
}

/**
 * An entry in the "Recommendations" section — every card carries
 * (title, detail, recommendation text, CTA) so the operator sees both
 * what's wrong AND what to do about it. Healthy state is rendered as
 * a single positive card with no CTA.
 */
export interface Recommendation {
  id: string;
  tone: InsightTone;
  iconKey: 'tokens' | 'consumer' | 'route' | 'auth' | 'check' | 'breakdown';
  title: string;
  /** Short factual context (e.g. "10% of total requests"). */
  detail: string;
  /** Action the operator should take ("Review prompt size and usage…"). */
  recommendation: string;
  cta?: { label: string; dashboard: DashboardKey };
}

/** 24 hourly points (or whatever lookback we end up using). */
export interface SparklineSeries {
  /** Calls per hour, normalised so the chart is comparable across periods. */
  calls: number[];
  /** Tokens per hour. */
  tokens: number[];
  /** Estimated cost per hour (calls × tier price + tokens × tier price). */
  cost: number[];
}

export interface UseCostByConsumerResult {
  rows: CostRow[];
  loaded: boolean;
  /** True when the ConfigMap declares a pricing table. */
  hasPricing: boolean;
  /**
   * The parsed per-tier pricing table from the ConfigMap. Empty record
   * when `hasPricing` is false. Exposed so the page can render the rate
   * card ("how costs are calculated") from the same source of truth the
   * cost math uses.
   */
  pricing: CostPricing;
  currency: string;
  totals: CostTotals;
  drivers: CostDriver[];
  topConsumer: CostRow | null;
  /** 0-100 share of the total spent by `topConsumer`. */
  topConsumerSharePct: number;
  /** 0-100 share of the total spent by the top 3 consumers combined. */
  top3SharePct: number;
  sparklines: SparklineSeries;
  /**
   * Loose forecast for "what this period should look like" — the
   * previous period ± 25%. Used to label the Estimated Cost KPI
   * ("Higher than expected" / "Within expected range"). Null when
   * there's no previous-period data yet (first 24h after deploy).
   */
  expectedCost: { min: number; max: number } | null;
  insights: CostInsight[];
  /** Cards for the "What changed?" section. */
  whatChanged: WhatChangedItem[];
  /** Cards for the "Recommendations" section. */
  recommendations: Recommendation[];
  /** Optional cap from the ConfigMap — `null` when unset. */
  budget: number | null;
  /** Period the page is reporting on, in human-readable form. */
  periodLabel: string;
}

/**
 * Lookback the page queries against. The user can wire a picker later;
 * for the first cut we report on the last 24h, which lines up with the
 * "this period" framing every billing system uses.
 */
const PERIOD_SECONDS = 24 * 60 * 60;
const SPARKLINE_POINTS = 24;
const SPARKLINE_STEP_SECONDS = PERIOD_SECONDS / SPARKLINE_POINTS;

/**
 * Match the APIKey's `planTier` against the pricing table. Case-
 * insensitive so a customer who types `Gold` instead of `gold` in the
 * ConfigMap doesn't silently drop the row's cost.
 */
function pickTier(
  pricing: CostPricing,
  tier: string,
): CostPricingTier | undefined {
  const direct = pricing[tier.toLowerCase()];
  if (direct) return direct;
  // Anonymous traffic (no x-consumer-id) maps to the `anonymous` tier
  // when the customer defined one — useful to demo "anonymous overage
  // is more expensive". Otherwise the row's cost stays at 0.
  return pricing.anonymous;
}

function splitCost(
  calls: number,
  tokens: number,
  tier: CostPricingTier | undefined,
): { callsCost: number; tokensCost: number } {
  if (!tier) return { callsCost: 0, tokensCost: 0 };
  return {
    callsCost: (calls / 1000) * tier.calls_per_1k,
    tokensCost: (tokens / 1000) * tier.tokens_per_1k,
  };
}

function pctDelta(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

// PromQL — `increase()` over the period gives totals; we run the same
// query twice (now vs `offset $PERIOD`) so the page can show a Δ column
// without an extra round-trip per row.
const callsQuery = (window: string): string =>
  `sum by (request_headers_x_consumer_id) (` +
  `increase(istio_requests_total{reporter="source"}[${window}])` +
  `)`;
const callsPrevQuery = (window: string): string =>
  `sum by (request_headers_x_consumer_id) (` +
  `increase(istio_requests_total{reporter="source"}[${window}] offset ${window})` +
  `)`;
const tokensQuery = (window: string): string =>
  `sum by (consumer_id) (increase(bank_ai_tokens_total[${window}]))`;
const tokensPrevQuery = (window: string): string =>
  `sum by (consumer_id) (increase(bank_ai_tokens_total[${window}] offset ${window}))`;

// Range queries powering the sparklines. Aggregated across consumers
// because the KPI cards show totals — per-consumer detail is the
// table's job. Step matches SPARKLINE_STEP_SECONDS so we get exactly
// SPARKLINE_POINTS values back.
const callsRangeQuery =
  `sum(rate(istio_requests_total{reporter="source"}[5m])) * 60`;
const tokensRangeQuery =
  `sum(rate(bank_ai_tokens_total[5m])) * 60`;

interface PromVector {
  metric: Record<string, string>;
  value: [number, string];
}
interface PromMatrix {
  metric: Record<string, string>;
  values: [number, string][];
}

async function instantQuery(
  query: string,
  signal: AbortSignal,
): Promise<PromVector[]> {
  const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
  const r = await consoleFetch(url, { signal }, 15_000);
  const json = (await r.json()) as { data?: { result?: PromVector[] } };
  return json.data?.result || [];
}

async function rangeQuery(
  query: string,
  startSec: number,
  endSec: number,
  stepSec: number,
  signal: AbortSignal,
): Promise<PromMatrix[]> {
  const params = new URLSearchParams({
    query,
    start: String(startSec),
    end: String(endSec),
    step: String(stepSec),
  });
  const url = `/api/prometheus/api/v1/query_range?${params.toString()}`;
  const r = await consoleFetch(url, { signal }, 20_000);
  const json = (await r.json()) as { data?: { result?: PromMatrix[] } };
  return json.data?.result || [];
}

/**
 * Period cost per consumer for the Cost Monitoring page (req018).
 *
 * Joins three pieces of state:
 *   1. Live APIKey watch → `consumer_id` (Secret name) → tier + product.
 *   2. Two PromQL aggregates for the current period — `istio_requests_total`
 *      bucketed by `request_headers_x_consumer_id`, `bank_ai_tokens_total`
 *      bucketed by `consumer_id`.
 *   3. The same aggregates 24h further back, for the Δ column.
 *
 * Multiplies calls and tokens by the per-tier pricing table the plugin
 * ConfigMap declares (`costPricing` JSON). When pricing is missing the
 * hook still returns the usage columns; the page just hides the cost
 * column in that case.
 */
export function useCostByConsumer(): UseCostByConsumerResult {
  const { config } = usePluginConfig();
  const pricing = React.useMemo(
    () => parseCostPricing(config.costPricing),
    [config.costPricing],
  );
  const hasPricing = Object.keys(pricing).length > 0;
  const currency = config.costCurrency || 'BRL';
  const budget = React.useMemo(() => {
    const raw = config.costBudget;
    if (raw == null) return null;
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [config.costBudget]);

  const [keys, keysLoaded] = useK8sWatchResource<APIKey[]>({
    groupVersionKind: APIKeyGVK,
    isList: true,
  });

  const [calls, setCalls] = React.useState<Record<string, number>>({});
  const [callsPrev, setCallsPrev] = React.useState<Record<string, number>>({});
  const [tokens, setTokens] = React.useState<Record<string, number>>({});
  const [tokensPrev, setTokensPrev] = React.useState<Record<string, number>>({});
  const [callsSeries, setCallsSeries] = React.useState<number[]>([]);
  const [tokensSeries, setTokensSeries] = React.useState<number[]>([]);
  const [promLoaded, setPromLoaded] = React.useState(false);

  usePollingEffect(
    async (signal) => {
      const win = `${PERIOD_SECONDS}s`;
      const end = Math.floor(Date.now() / 1000);
      const start = end - PERIOD_SECONDS;
      try {
        const [c, cp, t, tp, callsRange, tokensRange] = await Promise.all([
          instantQuery(callsQuery(win), signal),
          instantQuery(callsPrevQuery(win), signal),
          instantQuery(tokensQuery(win), signal),
          instantQuery(tokensPrevQuery(win), signal),
          rangeQuery(callsRangeQuery, start, end, SPARKLINE_STEP_SECONDS, signal),
          rangeQuery(tokensRangeQuery, start, end, SPARKLINE_STEP_SECONDS, signal),
        ]);
        if (signal.aborted) return;
        const toMap = (rows: PromVector[], labelKey: string): Record<string, number> => {
          const out: Record<string, number> = {};
          for (const row of rows) {
            const k = row.metric[labelKey];
            const v = parseFloat(row.value[1]);
            if (!k || !Number.isFinite(v)) continue;
            // Istio Telemetry emits the literal "<nil>" when the header
            // is absent. The Cost view shows it under the `anonymous`
            // bucket — normalise here so downstream join logic doesn't
            // have to special-case the placeholder.
            const consumer = k === '<nil>' ? 'anonymous' : k;
            out[consumer] = (out[consumer] || 0) + v;
          }
          return out;
        };
        const firstSeries = (m: PromMatrix[]): number[] => {
          if (m.length === 0) return [];
          return (m[0].values || []).map(([, v]) => {
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : 0;
          });
        };
        setCalls(toMap(c, 'request_headers_x_consumer_id'));
        setCallsPrev(toMap(cp, 'request_headers_x_consumer_id'));
        setTokens(toMap(t, 'consumer_id'));
        setTokensPrev(toMap(tp, 'consumer_id'));
        setCallsSeries(firstSeries(callsRange));
        setTokensSeries(firstSeries(tokensRange));
        setPromLoaded(true);
      } catch {
        if (signal.aborted) return;
        setPromLoaded(true);
      }
    },
    [],
    { intervalMs: 60_000, enabled: true },
  );

  return React.useMemo<UseCostByConsumerResult>(() => {
    const loaded = keysLoaded && promLoaded;

    // Build the per-consumer index from the APIKey list. Multiple APIKey
    // CRs can point at the same Secret name in theory; in practice the
    // devportal enforces uniqueness, but we still take the first one we
    // see and skip duplicates to keep the row count predictable.
    type KeyInfo = { tier: string; product: string | null; userId?: string };
    const indexByConsumer = new Map<string, KeyInfo>();
    for (const k of keys || []) {
      // SecretRef lives in `status.secretRef.name` (the v1alpha1 CRD
      // does not declare `spec.secretRef`). Fall back to spec for
      // older clusters / fixtures.
      const consumer =
        (k.status as { secretRef?: { name?: string } } | undefined)?.secretRef?.name ||
        k.spec?.secretRef?.name;
      if (!consumer || indexByConsumer.has(consumer)) continue;
      indexByConsumer.set(consumer, {
        tier: (k.spec?.planTier || 'unknown').toLowerCase(),
        product: k.spec?.apiProductRef?.name || null,
        userId: k.spec?.requestedBy?.userId,
      });
    }

    // The set of consumer ids we actually surface = union of every id
    // seen in EITHER Prometheus result OR the APIKey watch. That way:
    //   - keys with traffic but no APIKey CR (manual Secrets, legacy)
    //     still appear, labelled with the `unknown` tier;
    //   - keys with an APIKey CR but no traffic in the period appear
    //     too, showing 0 calls / 0 tokens / 0 cost so the operator
    //     can spot dormant subscriptions.
    const ids = new Set<string>([
      ...Object.keys(calls),
      ...Object.keys(tokens),
      ...indexByConsumer.keys(),
    ]);

    const rows: CostRow[] = [];
    for (const consumerId of ids) {
      const info = indexByConsumer.get(consumerId);
      const tier = info?.tier ?? (consumerId === 'anonymous' ? 'anonymous' : 'unknown');
      const callsCount = Math.round(calls[consumerId] || 0);
      const tokensCount = Math.round(tokens[consumerId] || 0);
      const prevCallsCount = Math.round(callsPrev[consumerId] || 0);
      const prevTokensCount = Math.round(tokensPrev[consumerId] || 0);
      const tierPricing = pickTier(pricing, tier);
      const split = splitCost(callsCount, tokensCount, tierPricing);
      const cost = hasPricing ? split.callsCost + split.tokensCost : null;
      const prevSplit = splitCost(prevCallsCount, prevTokensCount, tierPricing);
      const previousCost = hasPricing ? prevSplit.callsCost + prevSplit.tokensCost : null;
      const deltaPct =
        cost != null && previousCost != null
          ? pctDelta(cost, previousCost)
          : null;
      rows.push({
        consumerId,
        consumerLabel: info?.userId ? `${consumerId} · ${info.userId}` : consumerId,
        tier,
        product: info?.product ?? null,
        calls: callsCount,
        tokens: tokensCount,
        cost,
        callsCost: split.callsCost,
        tokensCost: split.tokensCost,
        previousCost,
        deltaPct,
      });
    }

    // Sort by cost desc when pricing is configured (operators care about
    // the biggest spenders); fall back to calls desc otherwise.
    rows.sort((a, b) => {
      if (hasPricing) return (b.cost || 0) - (a.cost || 0);
      return b.calls - a.calls;
    });

    // -------------------------------------------------------------
    // Roll-ups for the executive layout.
    // -------------------------------------------------------------
    const totalCost = rows.reduce((s, r) => s + (r.cost || 0), 0);
    const totalCalls = rows.reduce((s, r) => s + r.calls, 0);
    const totalTokens = rows.reduce((s, r) => s + r.tokens, 0);
    const totalPrevCost = rows.reduce((s, r) => s + (r.previousCost || 0), 0);
    const totalPrevCalls = Object.values(callsPrev).reduce((s, v) => s + v, 0);
    const totalPrevTokens = Object.values(tokensPrev).reduce((s, v) => s + v, 0);
    const totalCallsCost = rows.reduce((s, r) => s + r.callsCost, 0);
    const totalTokensCost = rows.reduce((s, r) => s + r.tokensCost, 0);

    const totals: CostTotals = {
      cost: totalCost,
      calls: totalCalls,
      tokens: totalTokens,
      previousCost: totalPrevCost,
      previousCalls: totalPrevCalls,
      previousTokens: totalPrevTokens,
      costDeltaPct: pctDelta(totalCost, totalPrevCost),
      callsDeltaPct: pctDelta(totalCalls, totalPrevCalls),
      tokensDeltaPct: pctDelta(totalTokens, totalPrevTokens),
    };

    const driverSum = totalCallsCost + totalTokensCost;
    const tokensDriver: CostDriver = {
      key: 'tokens',
      label: 'AI Tokens',
      cost: totalTokensCost,
      sharePct: driverSum > 0 ? (totalTokensCost / driverSum) * 100 : 0,
    };
    const callsDriver: CostDriver = {
      key: 'calls',
      label: 'Requests',
      cost: totalCallsCost,
      sharePct: driverSum > 0 ? (totalCallsCost / driverSum) * 100 : 0,
    };
    const drivers: CostDriver[] = [tokensDriver, callsDriver].sort(
      (a, b) => b.cost - a.cost,
    );

    const topConsumer = rows.length > 0 ? rows[0] : null;
    const topConsumerSharePct =
      topConsumer && totalCost > 0 && topConsumer.cost != null
        ? (topConsumer.cost / totalCost) * 100
        : 0;

    // Sparkline of cost: blend the call series and token series with
    // the *anonymous* tier price as a stand-in average. The chart is a
    // shape cue, not an audit-grade number — the table + Grafana are
    // the source of truth. Falls back to the calls-only line when no
    // pricing is configured.
    const anonymousTier = pickTier(pricing, 'anonymous');
    const costSeries =
      anonymousTier && hasPricing
        ? callsSeries.map((c, i) => {
            const t = tokensSeries[i] || 0;
            return (
              (c / 1000) * anonymousTier.calls_per_1k +
              (t / 1000) * anonymousTier.tokens_per_1k
            );
          })
        : callsSeries;

    // -------------------------------------------------------------
    // Insights — small, declarative truths the operator can act on.
    // -------------------------------------------------------------
    const insights: CostInsight[] = [];
    if (Number.isFinite(totals.tokensDeltaPct as number) && totals.tokens > 0) {
      const d = totals.tokensDeltaPct as number;
      insights.push({
        id: 'token-trend',
        tone: d > 25 ? 'warning' : 'positive',
        title:
          d >= 0
            ? `AI token usage increased ${d.toFixed(0)}%`
            : `AI token usage decreased ${Math.abs(d).toFixed(0)}%`,
        detail: 'compared to the previous 24h',
      });
    }
    if (topConsumer && topConsumerSharePct > 0) {
      insights.push({
        id: 'top-consumer',
        tone: topConsumerSharePct > 60 ? 'warning' : 'positive',
        title: `Top consumer "${topConsumer.consumerLabel}" generated ${topConsumerSharePct.toFixed(0)}% of cost`,
        detail:
          topConsumerSharePct > 60
            ? 'concentration risk — consider quota review'
            : 'within expected concentration range',
      });
    }
    const anonRow = rows.find((r) => r.tier === 'anonymous');
    const anonShare = totalCalls > 0 && anonRow ? (anonRow.calls / totalCalls) * 100 : 0;
    if (anonShare > 0) {
      insights.push({
        id: 'anonymous-share',
        tone: anonShare > 20 ? 'warning' : 'neutral',
        title: `Anonymous traffic is ${anonShare.toFixed(0)}% of requests`,
        detail:
          anonShare > 20
            ? 'consider tightening AuthPolicy on these routes'
            : 'within acceptable bounds',
      });
    }
    const unknownRows = rows.filter((r) => r.tier === 'unknown');
    const unknownCost = unknownRows.reduce((s, r) => s + (r.cost || 0), 0);
    if (unknownRows.length > 0) {
      insights.push({
        id: 'unknown-consumers',
        tone: 'warning',
        title: `${unknownRows.length} unknown consumer(s) active`,
        detail: hasPricing
          ? `~${unknownCost.toFixed(2)} ${currency} attributed to keys without a CR`
          : 'keys present in metrics but missing from APIKey watch',
      });
    } else if (rows.length > 0) {
      insights.push({
        id: 'consumers-known',
        tone: 'positive',
        title: 'All active consumers are mapped to APIKeys',
        detail: 'no orphan traffic detected',
      });
    }

    // -------------------------------------------------------------
    // Expected-cost band — used by the Estimated Cost KPI to label
    // whether today's spend is within the historical envelope. We
    // anchor on the previous-period cost and widen by ±25%; the band
    // is null until we have a previous-period reading at all.
    // -------------------------------------------------------------
    const expectedCost =
      totalPrevCost > 0
        ? { min: totalPrevCost * 0.75, max: totalPrevCost * 1.25 }
        : null;

    // -------------------------------------------------------------
    // Top-N concentration — feeds the "Cost concentrated on a few
    // resources" callout. Top 3 chosen because 4+ already counts
    // as healthy diversification on a per-tenant API.
    // -------------------------------------------------------------
    const top3SharePct =
      totalCost > 0
        ? (rows.slice(0, 3).reduce((s, r) => s + (r.cost || 0), 0) / totalCost) * 100
        : 0;

    // -------------------------------------------------------------
    // What changed? — causality. Only push items the data supports;
    // an empty list collapses to a single positive "no anomalies"
    // row at the page layer.
    // -------------------------------------------------------------
    const whatChanged: WhatChangedItem[] = [];
    if (Number.isFinite(totals.tokensDeltaPct as number) && (totals.tokensDeltaPct as number) > 100) {
      const d = totals.tokensDeltaPct as number;
      whatChanged.push({
        id: 'wc-tokens',
        tone: 'warning',
        iconKey: 'tokens',
        title: `AI token usage increased ${d.toFixed(0)}%`,
        detail: 'Main driver of cost increase.',
        cta: { label: 'Open AI Dashboard', dashboard: 'api-costs' },
      });
    }
    if (topConsumer && topConsumer.tier === 'anonymous' && topConsumerSharePct > 30) {
      whatChanged.push({
        id: 'wc-anon-concentration',
        tone: 'warning',
        iconKey: 'consumer',
        title: `Anonymous consumer generated ${topConsumerSharePct.toFixed(0)}% of total cost`,
        detail: 'High concentration on a single consumer.',
        cta: { label: 'Open Consumer', dashboard: 'api-consumers' },
      });
    }
    if (top3SharePct > 60) {
      whatChanged.push({
        id: 'wc-top3',
        tone: 'warning',
        iconKey: 'breakdown',
        title: 'Cost concentrated on a few resources',
        detail: `Top 3 consumers represent ${top3SharePct.toFixed(0)}% of total spend.`,
        cta: { label: 'View breakdown', dashboard: 'api-costs' },
      });
    }
    if (
      Number.isFinite(totals.costDeltaPct as number) &&
      Math.abs(totals.costDeltaPct as number) < 10
    ) {
      whatChanged.push({
        id: 'wc-stable',
        tone: 'positive',
        iconKey: 'check',
        title: 'Cost is stable',
        detail: `Within ±10% of the previous ${'24h'}.`,
      });
    }

    // -------------------------------------------------------------
    // Recommendations — action-oriented variant of the insights. The
    // healthy state collapses to a single positive card so the
    // section never reads empty.
    // -------------------------------------------------------------
    const recommendations: Recommendation[] = [];
    if (Number.isFinite(totals.tokensDeltaPct as number) && (totals.tokensDeltaPct as number) > 100) {
      const d = totals.tokensDeltaPct as number;
      recommendations.push({
        id: 'rec-tokens',
        tone: 'warning',
        iconKey: 'tokens',
        title: 'AI token usage increased',
        detail: `${d.toFixed(0)}% vs. previous period`,
        recommendation: 'Review prompt size and usage patterns.',
        cta: { label: 'Open AI Dashboard', dashboard: 'api-costs' },
      });
    }
    if (anonShare > 5) {
      recommendations.push({
        id: 'rec-anon-traffic',
        tone: 'warning',
        iconKey: 'auth',
        title: 'Anonymous traffic',
        detail: `${anonShare.toFixed(0)}% of total requests`,
        recommendation: 'AuthenticationPolicy missing. Protect this route.',
        cta: { label: 'Open Authentication Policy', dashboard: 'api-overview' },
      });
    }
    if (topConsumer && topConsumerSharePct > 40) {
      recommendations.push({
        id: 'rec-concentration',
        tone: 'warning',
        iconKey: 'consumer',
        title: 'High consumer concentration',
        detail: `${topConsumerSharePct.toFixed(0)}% of spend generated by a single consumer.`,
        recommendation: 'Review quotas and limits.',
        cta: { label: 'Open Consumer', dashboard: 'api-consumers' },
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-healthy',
        tone: 'positive',
        iconKey: 'check',
        title: 'Everything healthy',
        detail: 'No unusual traffic detected.',
        recommendation: 'Continue monitoring.',
      });
    } else {
      // Always lead with the green "stable" card when nothing alarming
      // is breaking through — keeps the section emotionally balanced.
      recommendations.unshift({
        id: 'rec-baseline',
        tone: 'positive',
        iconKey: 'check',
        title: 'Everything healthy',
        detail: 'No unusual traffic detected.',
        recommendation: 'Continue monitoring.',
      });
    }

    return {
      rows,
      loaded,
      hasPricing,
      pricing,
      currency,
      totals,
      drivers,
      topConsumer,
      topConsumerSharePct,
      top3SharePct,
      sparklines: { calls: callsSeries, tokens: tokensSeries, cost: costSeries },
      expectedCost,
      insights,
      whatChanged,
      recommendations,
      budget,
      periodLabel: 'Last 24 hours',
    };
  }, [
    keys,
    keysLoaded,
    calls,
    callsPrev,
    tokens,
    tokensPrev,
    callsSeries,
    tokensSeries,
    pricing,
    hasPricing,
    currency,
    promLoaded,
    budget,
  ]);
}
