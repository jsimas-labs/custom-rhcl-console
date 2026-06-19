import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { RateLimitPolicyGVK } from '../../models';
import {
  APIProductTargetRef,
  DiscoveredPlan,
  RateLimit,
  RateLimitPolicy,
} from '../../types';
import { policyAttachesTo } from '../../utils/policyTargets';
import RateLimitVisualizer, {
  RateLimitEntries,
} from '../policies/RateLimitVisualizer';

interface PlansCardsProps {
  /**
   * Synthesised plan summary from APIProduct.status. Used as a fallback
   * when no RateLimitPolicy is attached (rare in practice — the lab
   * always materialises one through PlanPolicy).
   */
  plans: DiscoveredPlan[];
  /**
   * The APIProduct's target (HTTPRoute or Gateway). Used to look up the
   * attached RateLimitPolicy and render the *actual* limits + predicates
   * — that's far more useful than the daily/weekly digest in
   * `discoveredPlans`.
   */
  targetRef?: APIProductTargetRef;
  /** Namespace of the APIProduct (fallback when targetRef has no namespace). */
  apiProductNamespace: string;
}

const PlansCards: React.FC<PlansCardsProps> = ({
  plans,
  targetRef,
  apiProductNamespace,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  // Watch ALL RateLimitPolicies cluster-wide and filter to the ones whose
  // target matches this APIProduct's target. We pick this over a namespace-
  // scoped watch because RLPs that target a Gateway live in the gateway's
  // namespace (often `openshift-ingress`), not in the API namespace.
  const [allRLPs, rlpLoaded] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });

  const targetNs = targetRef?.namespace || apiProductNamespace;
  const attached: RateLimitPolicy[] = React.useMemo(() => {
    if (!targetRef) return [];
    return (allRLPs || []).filter((p) =>
      policyAttachesTo(p, targetRef.kind || 'HTTPRoute', targetRef.name, targetNs),
    );
  }, [allRLPs, targetRef, targetNs]);

  // Merge top-level + defaults + overrides into one map. Showing them
  // separately would inflate the card count without giving more signal at
  // this overview level — the dedicated RateLimitPolicy detail page is
  // where the defaults/overrides split lives.
  const mergedLimits: RateLimitEntries = React.useMemo(() => {
    const out: RateLimitEntries = {};
    for (const p of attached) {
      for (const [k, v] of Object.entries(p.spec?.limits || {})) out[k] = v;
      for (const [k, v] of Object.entries(p.spec?.defaults?.limits || {})) out[k] = v;
      for (const [k, v] of Object.entries(p.spec?.overrides?.limits || {})) out[k] = v;
    }
    return out;
  }, [attached]);

  // ----- Render path 1: attached RateLimitPolicy(s) found -----
  if (rlpLoaded && Object.keys(mergedLimits).length > 0) {
    const firstPolicy = attached[0];
    const sourceLabel = attached.length === 1
      ? `RateLimitPolicy/${firstPolicy.metadata?.namespace}/${firstPolicy.metadata?.name}`
      : t('{{count}} RateLimitPolicies', { count: attached.length });
    const sourceHref = attached.length === 1
      ? `/connectivity-link/policies/ratelimit/${firstPolicy.metadata?.namespace}/${firstPolicy.metadata?.name}`
      : '/connectivity-link/policies';
    return (
      <RateLimitVisualizer
        limits={mergedLimits}
        variant="cards"
        sourceLabel={sourceLabel}
        sourceHref={sourceHref}
      />
    );
  }

  // ----- Render path 2: fall back to status.discoveredPlans -----
  // The synthesized plans only have daily/weekly/monthly windows — translate
  // them into the same RateLimit shape so the visualizer can render. The
  // higher of (daily, weekly, monthly) drives the displayed window so the
  // hero metric isn't misleadingly small.
  if (rlpLoaded && plans.length > 0) {
    const synth: RateLimitEntries = {};
    for (const p of plans) {
      const rates: RateLimit['rates'] = [];
      if (p.limits?.daily !== undefined) rates.push({ limit: p.limits.daily, window: '1d' });
      if (p.limits?.weekly !== undefined) rates.push({ limit: p.limits.weekly, window: '7d' });
      if (p.limits?.monthly !== undefined) rates.push({ limit: p.limits.monthly, window: '30d' });
      synth[p.tier] = { rates };
    }
    return (
      <RateLimitVisualizer
        limits={synth}
        variant="cards"
        sourceLabel={t('APIProduct.status.discoveredPlans')}
      />
    );
  }

  // ----- Nothing to render -----
  return (
    <EmptyState variant="sm" titleText={t('No plans available')} headingLevel="h4">
      <EmptyStateBody>
        {rlpLoaded
          ? t('No subscription plans or RateLimitPolicies are attached to this API.')
          : t('Loading rate-limit policies…')}
      </EmptyStateBody>
    </EmptyState>
  );
};

export default PlansCards;
