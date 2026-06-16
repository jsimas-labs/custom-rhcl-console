import * as React from 'react';
import {
  Drawer, DrawerContent, DrawerContentBody, DrawerPanelContent,
  Pagination, Spinner, EmptyState, EmptyStateBody, EmptyStateFooter,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../types/httproute';
import { useBackendsStatus } from '../../../hooks/useBackendsStatus';
import { BackendsSummary } from './BackendsSummary';
import { BackendsToolbar, BackendFilters, defaultFilters } from './BackendsToolbar';
import { BackendsTable, SortState } from './BackendsTable';
import { BackendDetailDrawer } from './BackendDetailDrawer';
import { backendKey, derivedStatusFor } from './utils/backendDerivedStatus';
import { dedupeBackends, DedupedBackend } from './utils/dedupeBackends';

interface Props {
  route: HTTPRoute | undefined;
}

/**
 * "Backends" tab — new layout (Summary KPIs + master/detail with Drawer).
 *
 * Replaces the previous "one big vertical card per backend" layout that
 * stopped scaling past ~5 backends and forced the operator to scroll to
 * find anything.
 *
 * State flow:
 *   - useBackendsStatus does the watches + flattening
 *   - this component owns search/filter/sort/page state + selection
 *   - BackendsTable is presentational (rows are clickable, no internal state)
 *   - BackendDetailDrawer renders only when something is selected
 *
 * Performance notes:
 *   - Each row gets its own `useBackendTraffic` hook (one Prom poll/min).
 *     For a route with N backends we make N small polls/min total — same
 *     order of magnitude as the old cards. Pagination unmounts rows
 *     off-screen, so visible polls ≤ perPage.
 *   - BackendsSummary makes ONE route-level Prom poll regardless of N.
 */
export const BackendsTab: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { backends, loaded } = useBackendsStatus(route);

  // ── UI state (kept in the parent so we can later sync to URL) ─────────────
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [filters, setFilters]         = React.useState<BackendFilters>(defaultFilters);
  const [sort, setSort]               = React.useState<SortState>({ index: 0, direction: 'asc' });
  const [page, setPage]               = React.useState(1);
  const [perPage, setPerPage]         = React.useState(10);

  // ── Dedup: collapse (rule, backendRef) entries into one row per Service ───
  // `useBackendsStatus` returns one entry per backendRef declared in the
  // route — so a Service that appears in N rules shows up N times. From
  // the operator's mental model that's just one Service; the rule list is
  // detail you only want to see when drilling into it.
  const deduped = React.useMemo<DedupedBackend[]>(
    () => dedupeBackends(backends, route),
    [backends, route],
  );

  // ── Search + filter (cheap, no Prom call) ─────────────────────────────────
  const filtered = React.useMemo<DedupedBackend[]>(() => {
    return deduped.filter((b) => {
      // Search by name (case-insensitive substring).
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!b.name.toLowerCase().includes(q)) return false;
      }
      // Health filter.
      if (filters.health !== 'all') {
        if (derivedStatusFor(b).status !== filters.health) return false;
      }
      // Resolution filter.
      if (filters.resolution !== 'all') {
        const isResolved = !!(b.resolvedRefs && b.serviceFound);
        if (filters.resolution === 'resolved'   && !isResolved) return false;
        if (filters.resolution === 'unresolved' &&  isResolved) return false;
      }
      return true;
    });
  }, [deduped, filters]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  // Sort only by the columns the user can click (Name, Health, Resolution,
  // Port, Endpoints). Traffic + Error columns need the per-row Prometheus
  // value, which is fetched inside each row and not available here at the
  // moment of sort — leaving those columns unsorted is a deliberate choice
  // (they'd flicker as numbers stream in otherwise).
  const sorted = React.useMemo<DedupedBackend[]>(() => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const copy = [...filtered];
    switch (sort.index) {
      case 0: // Name
        copy.sort((a, b) => dir * a.name.localeCompare(b.name)); break;
      case 1: // Health
        copy.sort((a, b) => dir * sortKeyForStatus(a).localeCompare(sortKeyForStatus(b))); break;
      case 2: // Resolution
        copy.sort((a, b) => dir * (Number(!!b.resolvedRefs && !!b.serviceFound) - Number(!!a.resolvedRefs && !!a.serviceFound))); break;
      case 3: // Port
        copy.sort((a, b) => dir * ((a.port ?? 0) - (b.port ?? 0))); break;
      case 4: // Endpoints (ready)
        copy.sort((a, b) => dir * (a.readyEndpoints - b.readyEndpoints)); break;
      default: break;
    }
    return copy;
  }, [filtered, sort]);

  // ── Paginate ──────────────────────────────────────────────────────────────
  const paged = React.useMemo<DedupedBackend[]>(
    () => sorted.slice((page - 1) * perPage, page * perPage),
    [sorted, page, perPage],
  );

  // Reset page when filter shrinks the list past the current page
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sorted.length / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [sorted.length, perPage, page]);

  // Resolve selected backend from sorted list (so selection survives filter changes)
  const selected = React.useMemo<DedupedBackend | null>(
    () => sorted.find((b) => backendKey(b) === selectedKey) ?? null,
    [sorted, selectedKey],
  );

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!loaded) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spinner size="lg" /></div>;
  }
  if (backends.length === 0) {
    return (
      <EmptyState variant="sm" titleText={t('No backends')} headingLevel="h3">
        <EmptyStateBody>
          {t('This HTTPRoute does not declare any backendRefs.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // ── Drawer panel content ──────────────────────────────────────────────────
  const panelContent = (
    <DrawerPanelContent isResizable defaultSize="44%" minSize="380px">
      {selected ? (
        <BackendDetailDrawer
          backend={selected}
          route={route}
          onClose={() => setSelectedKey(null)}
        />
      ) : (
        <EmptyState variant="sm" titleText={t('Select a backend')} headingLevel="h4">
          <EmptyStateBody>
            {t('Pick a row to see details, run a probe, or view YAML.')}
          </EmptyStateBody>
          <EmptyStateFooter>
            <span style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
              {t('You can resize this panel by dragging its left edge.')}
            </span>
          </EmptyStateFooter>
        </EmptyState>
      )}
    </DrawerPanelContent>
  );

  return (
    <>
      <BackendsSummary backends={deduped} route={route} />

      <Drawer isExpanded isInline>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            <BackendsToolbar
              filters={filters}
              onChange={(f) => { setFilters(f); setPage(1); }}
              total={sorted.length}
            />
            <BackendsTable
              backends={paged}
              route={route}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              sort={sort}
              onSort={setSort}
            />
            <Pagination
              itemCount={sorted.length}
              page={page}
              perPage={perPage}
              perPageOptions={[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 },
              ]}
              onSetPage={(_e, p) => setPage(p)}
              onPerPageSelect={(_e, pp) => { setPerPage(pp); setPage(1); }}
              variant="bottom"
              isCompact
            />
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/**
 * Health column sort: ordered bad → warn → ok by default ASC, so the
 * problematic backends bubble to the top — that's almost always what an
 * operator wants when they click that column.
 */
function sortKeyForStatus(b: DedupedBackend): string {
  const s = derivedStatusFor(b).status;
  return s === 'bad' ? '0' : s === 'warn' ? '1' : '2';
}
