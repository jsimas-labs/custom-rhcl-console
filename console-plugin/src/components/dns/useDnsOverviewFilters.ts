import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

/**
 * Filter state for the DNS Overview page.
 *
 * Lifted from the table into a page-level hook so that:
 *   - KPI cards can filter by status on click
 *   - the Propagation Distribution histogram bars can filter by status
 *   - the Top Providers donut slices can filter by provider
 *   - the URL query string carries the current scope so bookmarking and
 *     "back" from the Troubleshooting page restore filters
 *
 * URL params, each optional:
 *   ?search=…&gateway=…&provider=…&status=…&namespace=…&recordType=…
 */

export interface DnsOverviewFilters {
  search: string;
  gateway: string | null;
  provider: string | null;
  status: string | null;
  namespace: string | null;
  recordType: string | null;
}

const EMPTY: DnsOverviewFilters = {
  search: '',
  gateway: null,
  provider: null,
  status: null,
  namespace: null,
  recordType: null,
};

const PARAM_MAP: Array<[keyof DnsOverviewFilters, string]> = [
  ['search', 'search'],
  ['gateway', 'gateway'],
  ['provider', 'provider'],
  ['status', 'status'],
  ['namespace', 'namespace'],
  ['recordType', 'recordType'],
];

function readFromSearch(search: string): DnsOverviewFilters {
  const q = new URLSearchParams(search);
  const next: DnsOverviewFilters = { ...EMPTY };
  for (const [key, param] of PARAM_MAP) {
    const v = q.get(param);
    if (v == null || v === '') continue;
    (next as unknown as Record<string, string | null>)[key as string] = v;
  }
  return next;
}

export function useDnsOverviewFilters() {
  const location = useLocation();
  const history = useHistory();

  const [filters, setFilters] = React.useState<DnsOverviewFilters>(() =>
    readFromSearch(location.search),
  );

  // External URL edits (back/forward, paste) sync into state — but we
  // don't fire an infinite update loop because setFilters below writes
  // the same URL back and readFromSearch produces the same shape.
  React.useEffect(() => {
    const fromUrl = readFromSearch(location.search);
    setFilters((prev) => {
      const same = PARAM_MAP.every(([k]) => prev[k] === fromUrl[k]);
      return same ? prev : fromUrl;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const applyOne = React.useCallback(
    <K extends keyof DnsOverviewFilters>(key: K, value: DnsOverviewFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        const q = new URLSearchParams(location.search);
        for (const [k, param] of PARAM_MAP) {
          const v = next[k];
          if (v == null || v === '') q.delete(param);
          else q.set(param, String(v));
        }
        const s = q.toString();
        history.replace({
          pathname: location.pathname,
          search: s ? `?${s}` : '',
        });
        return next;
      });
    },
    [history, location.pathname, location.search],
  );

  const clearAll = React.useCallback(() => {
    setFilters(EMPTY);
    // Wipe the whole query string; anything else (e.g. `hostname=` set
    // by a deep link) is filter noise now that the operator asked for
    // "everything".
    history.replace({ pathname: location.pathname, search: '' });
  }, [history, location.pathname]);

  return { filters, applyOne, clearAll };
}
