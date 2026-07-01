import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Spinner,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Label,
  ExpandableSection,
  Grid,
  GridItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ExpandableRowContent } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { PlanPolicyGVK, APIKeyGVK } from '../../models';
import { PlanPolicy, APIKey } from '../../types';
import StatusLabel from '../common/StatusLabel';
import '../../styles/plugin-glass.css';

/**
 * Cluster-wide PlanPolicy browser. Each PlanPolicy declares the tiers
 * (gold/silver/bronze/…) the upstream Kuadrant extension controller
 * materialises into a RateLimitPolicy. This view surfaces:
 *   - which gateway / route the policy attaches to,
 *   - the tier table with its rate limit and CEL predicate, and
 *   - how many issued APIKeys actually use each tier (so an operator can
 *     see at a glance whether a tier is dead weight or oversubscribed).
 */
const TIER_COLORS: Record<string, 'yellow' | 'grey' | 'orange' | 'blue'> = {
  gold: 'yellow',
  silver: 'grey',
  bronze: 'orange',
};

function formatLimit(rate?: { limit: number; window: string }) {
  if (!rate) return '—';
  return `${rate.limit} / ${rate.window}`;
}

const PlansListPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [policies, policiesLoaded] = useK8sWatchResource<PlanPolicy[]>({
    groupVersionKind: PlanPolicyGVK,
    isList: true,
  });
  const [keys, keysLoaded] = useK8sWatchResource<APIKey[]>({
    groupVersionKind: APIKeyGVK,
    isList: true,
  });

  // Count APIKeys per (policy namespace, tier). The match is intentionally
  // loose — we attribute every APIKey in the same namespace as a PlanPolicy
  // to that policy. A stricter mapping would walk the APIKey -> APIProduct
  // ownerRef -> HTTPRoute -> PlanPolicy.targetRef chain, but for the lab
  // the looser model gives the right answer 99% of the time and keeps the
  // table fast.
  const keysByNsAndTier = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const k of keys || []) {
      const key = `${k.metadata?.namespace}/${k.spec.planTier}`;
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [keys]);

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggle = (uid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  if (!policiesLoaded || !keysLoaded) {
    return (
      <Bullseye style={{ minHeight: 200 }}>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  return (
    <div className="rhcl-plugin-root">
      <PageSection variant="default">
        <Title headingLevel="h1">{t('Plans')}</Title>
        <p style={{ marginTop: 4, color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
          {t(
            'Plan tiers declared by PlanPolicy resources — the rate limits and matchers the gateway enforces on each consumer.',
          )}
        </p>
        <div style={{ marginTop: 12 }}>
          <Label color="grey" isCompact>
            {(policies || []).length} {t('PlanPolicy', { count: (policies || []).length })}
          </Label>
        </div>
      </PageSection>

      <PageSection>
        <Card>
          <CardBody>
            {(policies || []).length === 0 ? (
              <EmptyState variant="sm" titleText={t('No PlanPolicies')} headingLevel="h4">
                <EmptyStateBody>
                  {t(
                    'No PlanPolicy resources are defined. PlanPolicy lives in extensions.kuadrant.io/v1alpha1.',
                  )}
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <Table aria-label={t('Plans')} variant="compact">
                <Thead>
                  <Tr>
                    <Th />
                    <Th>{t('PlanPolicy')}</Th>
                    <Th>{t('Target')}</Th>
                    <Th>{t('Tiers')}</Th>
                    <Th>{t('API Keys')}</Th>
                    <Th>{t('Status')}</Th>
                  </Tr>
                </Thead>
                {(policies || []).map((p, idx) => {
                  const uid = p.metadata?.uid || `${idx}`;
                  const ns = p.metadata?.namespace || '';
                  const ref = p.spec?.targetRef;
                  const targetPath = ref
                    ? ref.kind === 'Gateway'
                      ? `/connectivity-link/gateways/${ns}/${ref.name}`
                      : `/connectivity-link/httproutes/${ns}/${ref.name}`
                    : '';
                  const tiers = p.spec?.plans || [];
                  const tierNames = tiers.map((tier) => tier.tier).join(', ');
                  const totalKeys = tiers.reduce(
                    (sum, tier) => sum + (keysByNsAndTier.get(`${ns}/${tier.tier}`) || 0),
                    0,
                  );
                  const isExpanded = expanded.has(uid);
                  return (
                    <Tbody key={uid} isExpanded={isExpanded}>
                      <Tr>
                        <Td
                          expand={{
                            rowIndex: idx,
                            isExpanded,
                            onToggle: () => toggle(uid),
                            expandId: `expand-${uid}`,
                          }}
                        />
                        <Td>
                          <div style={{ fontWeight: 600 }}>{p.metadata?.name}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--pf-t--global--color--nonstatus--gray--default)',
                            }}
                          >
                            {ns}
                          </div>
                        </Td>
                        <Td>
                          {ref ? (
                            <Link to={targetPath}>
                              <Label color="purple" isCompact>
                                {ref.kind}
                              </Label>{' '}
                              {ref.name}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </Td>
                        <Td>{tierNames || '—'}</Td>
                        <Td>{totalKeys}</Td>
                        <Td>
                          <StatusLabel conditions={p.status?.conditions} />
                        </Td>
                      </Tr>
                      <Tr isExpanded={isExpanded}>
                        <Td colSpan={6} noPadding>
                          <ExpandableRowContent>
                            <PlanDetails policy={p} keysByNsAndTier={keysByNsAndTier} />
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    </Tbody>
                  );
                })}
              </Table>
            )}
          </CardBody>
        </Card>
      </PageSection>
    </div>
  );
};

const PlanDetails: React.FC<{
  policy: PlanPolicy;
  keysByNsAndTier: Map<string, number>;
}> = ({ policy, keysByNsAndTier }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const ns = policy.metadata?.namespace || '';
  const tiers = policy.spec?.plans || [];
  return (
    <div style={{ padding: 16 }}>
      <Grid hasGutter>
        {tiers.map((tier) => {
          const count = keysByNsAndTier.get(`${ns}/${tier.tier}`) || 0;
          const rate = tier.limits?.custom?.[0];
          return (
            <GridItem key={tier.tier} span={6} lg={4}>
              <Card>
                <CardBody>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Label color={TIER_COLORS[tier.tier] || 'blue'}>{tier.tier}</Label>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--pf-t--global--color--nonstatus--gray--default)',
                      }}
                    >
                      {count} {t('keys')}
                    </span>
                  </div>
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Rate limit')}</DescriptionListTerm>
                      <DescriptionListDescription>{formatLimit(rate)}</DescriptionListDescription>
                    </DescriptionListGroup>
                    {tier.predicate && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Predicate')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <code style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                            {tier.predicate.trim()}
                          </code>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                  </DescriptionList>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </Grid>
      <ExpandableSection toggleText={t('Status conditions')} style={{ marginTop: 12 }}>
        <pre style={{ fontSize: 12, background: 'var(--pf-t--global--color--nonstatus--gray--100)', padding: 8 }}>
          {JSON.stringify(policy.status?.conditions || [], null, 2)}
        </pre>
      </ExpandableSection>
    </div>
  );
};

export default PlansListPage;
