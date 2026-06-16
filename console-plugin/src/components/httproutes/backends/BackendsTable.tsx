import * as React from 'react';
import { Label, Tooltip } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td, ThProps } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../types/httproute';
import { useBackendTraffic } from '../../../hooks/useBackendTraffic';
import { backendKey, derivedStatusFor, labelColorForStatus } from './utils/backendDerivedStatus';
import { DedupedBackend } from './utils/dedupeBackends';

export interface SortState {
  index: number;
  direction: 'asc' | 'desc';
}

interface Props {
  backends: DedupedBackend[];
  route: HTTPRoute | undefined;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  sort: SortState;
  onSort: (s: SortState) => void;
}

const COLUMN_KEYS = [
  'Name',
  'Health',
  'Resolution',
  'Port',
  'Endpoints',
  'Rules',
  'Traffic (5m)',
  'Error rate (5m)',
] as const;

/**
 * Compact, sortable, clickable table. Each Tr is selectable; clicking a row
 * opens the drawer (handled by the parent).
 *
 * Per-row polling: traffic numbers are fetched per-backend via the existing
 * `useBackendTraffic` hook — same pattern the old cards used, so no extra
 * Prometheus load. Each row has its own poll + AbortController; rows that
 * scroll off-screen (via pagination) unmount and stop polling automatically.
 */
export const BackendsTable: React.FC<Props> = ({
  backends, route, selectedKey, onSelect, sort, onSort,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const sortFor = (index: number): ThProps['sort'] => ({
    sortBy: sort,
    onSort: (_e, i, d) => onSort({ index: i, direction: d }),
    columnIndex: index,
  });

  return (
    <Table variant="compact" aria-label={t('Backends')} isStickyHeader>
      <Thead>
        <Tr>
          {COLUMN_KEYS.map((c, i) => (
            <Th key={c} sort={sortFor(i)}>{t(c)}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {backends.map((b) => {
          const key = backendKey(b);
          const derived = derivedStatusFor(b);
          return (
            <Tr
              key={key}
              isClickable
              isRowSelected={key === selectedKey}
              onRowClick={() => onSelect(key)}
            >
              <Td dataLabel={t('Name')}
                  style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                {b.name}
              </Td>
              <Td dataLabel={t('Health')}>
                <Label color={labelColorForStatus(derived.status)} isCompact>
                  {t(derived.statusKey)}
                </Label>
              </Td>
              <Td dataLabel={t('Resolution')}>
                {b.resolvedRefs && b.serviceFound ? (
                  <Label color="green" isCompact>{t('Resolved')}</Label>
                ) : (
                  <Tooltip
                    content={
                      !b.serviceFound
                        ? t('Service not found in the cluster via live watch.')
                        : t('Route status.parents reports ResolvedRefs=False.')
                    }
                  >
                    <Label color="red" isCompact>{t('Unresolved')}</Label>
                  </Tooltip>
                )}
              </Td>
              <Td dataLabel={t('Port')}>{b.port ?? '—'}</Td>
              <Td dataLabel={t('Endpoints')}>
                <EndpointsCell ready={b.readyEndpoints} total={b.totalEndpoints} />
              </Td>
              <Td dataLabel={t('Rules')}>
                <RulesCell deduped={b} />
              </Td>
              <TrafficCells route={route} backend={b} />
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

/**
 * Tiny cell that summarises "how many rules in the route reference this Service".
 * Displayed as a compact label so it doesn't compete with the Health column —
 * the actual rule list is a click away in the drawer.
 */
const RulesCell: React.FC<{ deduped: DedupedBackend }> = ({ deduped }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const summary = deduped.rules
    .map((r) => `#${r.ruleIndex + 1}  ${r.label}` + (r.weight !== 1 ? `  (weight ${r.weight})` : ''))
    .join('\n');
  // Show weight=N when it's not 1 — call attention to weighted splits.
  const hasNonTrivialWeight = deduped.weights.some((w) => w !== 1);
  const text = `${deduped.ruleCount} rule${deduped.ruleCount === 1 ? '' : 's'}`;
  return (
    <Tooltip content={<div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>{summary}</div>}>
      <Label color={hasNonTrivialWeight ? 'orange' : 'blue'} isCompact>
        {text}{hasNonTrivialWeight ? ` · ${t('weighted')}` : ''}
      </Label>
    </Tooltip>
  );
};

const EndpointsCell: React.FC<{ ready: number; total: number }> = ({ ready, total }) => {
  const txt = `${ready}/${total}`;
  // Red when zero ready out of N (operational hot spot), grey otherwise.
  if (total > 0 && ready === 0) {
    return <Label color="red" isCompact>{txt}</Label>;
  }
  return <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>{txt}</span>;
};

/**
 * Traffic + error rate cells. Isolated component so each row's polling hook
 * lives in its own component instance — keeps rows independent (one row's
 * Prometheus stutter doesn't block others) and lets React mount/unmount the
 * hook when rows scroll into/out of the page.
 */
const TrafficCells: React.FC<{
  route: HTTPRoute | undefined;
  backend: DedupedBackend;
}> = ({ route, backend }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { data, loaded, metricsAvailable } = useBackendTraffic(
    route?.metadata?.namespace ?? '',
    route?.metadata?.name ?? '',
    backend.namespace,
    backend.name,
  );

  // Two cells share the same loading state — render placeholders together.
  if (!loaded) {
    return (
      <>
        <Td dataLabel={t('Traffic (5m)')}>—</Td>
        <Td dataLabel={t('Error rate (5m)')}>—</Td>
      </>
    );
  }
  if (!metricsAvailable) {
    return (
      <>
        <Td dataLabel={t('Traffic (5m)')}>
          <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            {t('n/a')}
          </span>
        </Td>
        <Td dataLabel={t('Error rate (5m)')}>—</Td>
      </>
    );
  }

  const req = data.reqRate;
  const reqText = req !== null ? `${formatRate(req)} req/s` : '—';

  // Error rate from successRate isn't quite right per-backend; the hook
  // exposes errorRate as 5xx req/s — so we compute % only if we have both.
  const errRate5xx = data.errorRate;     // req/s
  const total      = data.reqRate;       // req/s
  const errPct =
    errRate5xx !== null && total !== null && total > 0
      ? (errRate5xx / total) * 100
      : errRate5xx === 0 ? 0 : null;

  const errColor =
    errPct === null      ? undefined
    : errPct === 0       ? 'green'
    : errPct < 1         ? 'orange'
    : 'red';

  return (
    <>
      <Td dataLabel={t('Traffic (5m)')}>
        <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
          {reqText}
        </span>
      </Td>
      <Td dataLabel={t('Error rate (5m)')}>
        {errPct === null ? (
          <span>—</span>
        ) : (
          <Label color={errColor} isCompact>
            {errPct < 0.01 && errPct > 0 ? '<0.01%' : `${errPct.toFixed(2)}%`}
          </Label>
        )}
      </Td>
    </>
  );
};

function formatRate(r: number): string {
  if (r >= 100) return r.toFixed(0);
  if (r >= 10)  return r.toFixed(1);
  return r.toFixed(2);
}
