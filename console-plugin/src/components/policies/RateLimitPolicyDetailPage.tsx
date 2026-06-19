import * as React from 'react';
// SDK 4.21 wraps plugin pages in <CompatRouter> which populates the v6
// router context. v5's `useParams` reads the v5 context and returns {}.
// Use the v5-compat shim (which reads v6) for params; keep <Link> from
// react-router-dom (v5) since it just renders an anchor.
import { useParams } from 'react-router-dom-v5-compat';
import { Link } from 'react-router-dom';
import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Spinner,
  Bullseye,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  EmptyState,
  EmptyStateBody,
  Label,
} from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import {
  RateLimitPolicyGVK,
  APIProductGVK,
} from '../../models';
import {
  RateLimitPolicy,
  APIProduct,
  RateLimit,
} from '../../types';
import { primaryTargetRef } from '../../utils/policyTargets';
import StatusLabel from '../common/StatusLabel';
import TopConsumers from '../api-products/TopConsumers';
import RateLimitVisualizer from './RateLimitVisualizer';
import RateLimitOperationalMetrics from './RateLimitOperationalMetrics';
import RateLimitTrendChart from './RateLimitTrendChart';

/**
 * Plugin-owned detail view for a RateLimitPolicy.
 *
 * The native console takes the user to the CR YAML — useful for editing,
 * but useless for "how is this policy actually limiting traffic right
 * now?". This page focuses on that question:
 *
 *   1. Target — which Gateway/HTTPRoute is being protected, and at what
 *      semantic level (defaults vs overrides).
 *   2. Limits — the actual rates, windows and predicates, visualised by
 *      RateLimitVisualizer.
 *   3. Used by — which APIProducts derive their plan info from this RLP
 *      (best-effort reverse lookup via APIProduct status).
 */
const RateLimitPolicyDetailPage: React.FC = () => {
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [policies, loaded] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const policy = (policies || []).find(
    (p) => p.metadata?.name === name && p.metadata?.namespace === ns,
  );

  const [apiProducts] = useK8sWatchResource<APIProduct[]>({
    groupVersionKind: APIProductGVK,
    isList: true,
  });

  if (!loaded) {
    return (
      <PageSection isFilled>
        <Bullseye><Spinner size="xl" /></Bullseye>
      </PageSection>
    );
  }

  if (!policy) {
    return (
      <PageSection>
        <EmptyState variant="sm" titleText={t('RateLimitPolicy not found')} headingLevel="h2">
          <EmptyStateBody>
            {t('{{ns}}/{{name}} could not be located.', { ns, name })}
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  // Spec may put limits at the top level, or under defaults/overrides — when
  // composing with another RLP on the same chain. Surface each chunk it has.
  const topLimits = policy.spec?.limits || {};
  const defaultsLimits = policy.spec?.defaults?.limits || {};
  const overridesLimits = policy.spec?.overrides?.limits || {};
  const totalLimits =
    Object.keys(topLimits).length +
    Object.keys(defaultsLimits).length +
    Object.keys(overridesLimits).length;

  const targetRef = primaryTargetRef(policy);
  const targetNs = targetRef?.namespace || ns || '';
  const targetPath = targetRef
    ? targetRef.kind === 'Gateway'
      ? `/connectivity-link/gateways/${targetNs}/${targetRef.name}`
      : `/connectivity-link/httproutes/${targetNs}/${targetRef.name}`
    : '';

  // Reverse lookup: APIProducts whose target is the same HTTPRoute as this
  // RLP's target. Lets the user jump directly from the policy to the API
  // that surfaces it to consumers.
  const usedBy = (apiProducts || []).filter((p) => {
    if (!targetRef || targetRef.kind !== 'HTTPRoute') return false;
    const ap = p.spec?.targetRef;
    return ap?.kind === 'HTTPRoute' && ap.name === targetRef.name &&
      (ap.namespace || p.metadata?.namespace) === targetNs;
  });

  // Merged limits across the spec — used for the KPI header so the
  // "configured" calculation considers every rate the policy attaches.
  const mergedLimits: Record<string, RateLimit> = {
    ...topLimits,
    ...defaultsLimits,
    ...overridesLimits,
  };

  // Policy Configuration block synthesises the operational summary the user
  // wants on this page: algorithm, window (tightest), burst budget, scope,
  // and a timeline of when it last changed. The values come straight from
  // the spec — no extra calls.
  const allRates = Object.values(mergedLimits).flatMap((l) => l.rates || []);
  const tightestWindow = allRates
    .map((r) => r.window)
    .sort()[0] || '—';
  const totalBudget = allRates.reduce((sum, r) => sum + (r.limit || 0), 0);
  const scope = describeScope(policy);

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/connectivity-link/policies">{t('Policies')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{ns}/{name}</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" style={{ marginTop: 8 }}>
          {name} <StatusLabel conditions={policy.status?.conditions} />
          <Label color="blue" style={{ marginLeft: 8 }}>{t('RateLimitPolicy')}</Label>
        </Title>
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          {/* Operational KPI strip — answers "is this limit doing anything
              right now?" before the user even scrolls. */}
          {targetRef && (
            <GridItem span={12}>
              <RateLimitOperationalMetrics
                targetKind={targetRef.kind === 'Gateway' ? 'Gateway' : 'HTTPRoute'}
                targetName={targetRef.name}
                targetNamespace={targetNs}
                limits={mergedLimits}
              />
            </GridItem>
          )}

          {/* Usage trend — allowed vs rejected over the last hour. */}
          {targetRef && (
            <GridItem span={12}>
              <RateLimitTrendChart
                targetKind={targetRef.kind === 'Gateway' ? 'Gateway' : 'HTTPRoute'}
                targetName={targetRef.name}
                targetNamespace={targetNs}
              />
            </GridItem>
          )}

          {/* Top consumers — only meaningful for HTTPRoute-scoped policies
              because the Prometheus query joins on `route_name`. */}
          {targetRef?.kind === 'HTTPRoute' && (
            <GridItem md={6}>
              <TopConsumers routeName={targetRef.name} namespace={targetNs} />
            </GridItem>
          )}

          {/* Policy Configuration — operational summary from the spec. */}
          <GridItem md={targetRef?.kind === 'HTTPRoute' ? 6 : 12}>
            <Card>
              <CardTitle>{t('Policy configuration')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Algorithm')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {t('Token bucket')}{' '}
                      <span style={{ color: 'var(--pf-v5-global--Color--300)', fontSize: 12 }}>
                        ({t('Limitador default')})
                      </span>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Window')}</DescriptionListTerm>
                    <DescriptionListDescription><code>{tightestWindow}</code></DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Total budget')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {allRates.length === 0 ? '∞' : totalBudget.toLocaleString()}{' '}
                      <span style={{ color: 'var(--pf-v5-global--Color--300)' }}>
                        {t('across {{n}} rate spec(s)', { n: allRates.length })}
                      </span>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Scope')}</DescriptionListTerm>
                    <DescriptionListDescription>{scope}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {policy.metadata?.creationTimestamp
                        ? new Date(policy.metadata.creationTimestamp).toLocaleString()
                        : '—'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Target panel */}
          <GridItem md={6}>
            <Card>
              <CardTitle>{t('Target')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Kind')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {targetRef ? <Label color="blue" isCompact>{targetRef.kind}</Label> : '—'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {targetRef ? (
                        <Link to={targetPath}>{targetRef.name}</Link>
                      ) : (
                        '—'
                      )}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
                    <DescriptionListDescription>{targetNs || '—'}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Total limits')}</DescriptionListTerm>
                    <DescriptionListDescription>{totalLimits}</DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Reverse-lookup panel */}
          <GridItem md={6}>
            <Card>
              <CardTitle>{t('Used by API Products')}</CardTitle>
              <CardBody>
                {usedBy.length === 0 ? (
                  <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                    {t('No APIProduct surfaces this policy yet.')}
                  </span>
                ) : (
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {usedBy.map((p) => (
                      <li key={p.metadata?.uid}>
                        <Link
                          to={`/connectivity-link/api-products/${p.metadata?.namespace}/${p.metadata?.name}`}
                        >
                          {p.spec?.displayName || p.metadata?.name}
                        </Link>{' '}
                        <span style={{ color: 'var(--pf-v5-global--Color--300)' }}>
                          ({p.metadata?.namespace}/{p.metadata?.name})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Limits sections — one per block (top-level / defaults / overrides) */}
          {Object.keys(topLimits).length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardTitle>{t('Limits')}</CardTitle>
                <CardBody>
                  <RateLimitVisualizer limits={topLimits} variant="cards" />
                </CardBody>
              </Card>
            </GridItem>
          )}
          {Object.keys(defaultsLimits).length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardTitle>
                  {t('Defaults')}{' '}
                  <Label color="grey" isCompact>
                    {t('overridable by routes attached to this target')}
                  </Label>
                </CardTitle>
                <CardBody>
                  <RateLimitVisualizer limits={defaultsLimits} variant="cards" />
                </CardBody>
              </Card>
            </GridItem>
          )}
          {Object.keys(overridesLimits).length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardTitle>
                  {t('Overrides')}{' '}
                  <Label color="red" isCompact>
                    {t('hard ceiling — cannot be relaxed by lower-level policies')}
                  </Label>
                </CardTitle>
                <CardBody>
                  <RateLimitVisualizer limits={overridesLimits} variant="cards" />
                </CardBody>
              </Card>
            </GridItem>
          )}

          {totalLimits === 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <EmptyState
                    variant="sm"
                    titleText={t('No limits declared')}
                    headingLevel="h3"
                  >
                    <EmptyStateBody>
                      {t('This RateLimitPolicy is attached but does not declare any rates — all requests pass.')}
                    </EmptyStateBody>
                  </EmptyState>
                </CardBody>
              </Card>
            </GridItem>
          )}
        </Grid>
      </PageSection>
    </>
  );
};

/**
 * Synthesises a human "scope" description from the policy spec:
 *   - `Per API Key` when any limit's `counters` mentions an auth identity
 *     selector
 *   - `Per route` for an HTTPRoute-scoped policy without counters
 *   - `Per gateway` for a Gateway-scoped policy without counters
 *   - `Custom counter (<keys>)` when the policy declares custom counter keys
 *
 * Pure string derivation — no metrics needed.
 */
function describeScope(policy: RateLimitPolicy): string {
  const allLimits = {
    ...(policy.spec?.limits || {}),
    ...(policy.spec?.defaults?.limits || {}),
    ...(policy.spec?.overrides?.limits || {}),
  };
  const counters = Object.values(allLimits)
    .flatMap((l) => l.counters || [])
    .filter(Boolean);
  if (counters.length > 0) {
    const apiKeyMatch = counters.some((c) =>
      /(api[_-]?key|identity|consumer|metadata\.name)/i.test(c),
    );
    if (apiKeyMatch) return 'Per API Key';
    return `Custom counter (${counters.slice(0, 2).join(', ')}${counters.length > 2 ? '…' : ''})`;
  }
  const targetKind = primaryTargetRef(policy)?.kind;
  if (targetKind === 'Gateway') return 'Per gateway';
  if (targetKind === 'HTTPRoute') return 'Per route';
  return '—';
}

export default RateLimitPolicyDetailPage;
