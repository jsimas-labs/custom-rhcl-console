import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

/**
 * Filter state for the TLS Overview page. Same shape as the DNS
 * Overview equivalent — lifted so KPI cards + widget slices + the
 * Needs Attention banner can all mutate it, and the URL query string
 * carries the current scope.
 */

export interface TlsOverviewFilters {
  search: string;
  gateway: string | null;
  issuer: string | null;
  status: string | null;
  namespace: string | null;
}

const EMPTY: TlsOverviewFilters = {
  search: '',
  gateway: null,
  issuer: null,
  status: null,
  namespace: null,
};

const PARAM_MAP: Array<[keyof TlsOverviewFilters, string]> = [
  ['search', 'search'],
  ['gateway', 'gateway'],
  ['issuer', 'issuer'],
  ['status', 'status'],
  ['namespace', 'namespace'],
];

function readFromSearch(search: string): TlsOverviewFilters {
  const q = new URLSearchParams(search);
  const next: TlsOverviewFilters = { ...EMPTY };
  for (const [key, param] of PARAM_MAP) {
    const v = q.get(param);
    if (v == null || v === '') continue;
    (next as unknown as Record<string, string | null>)[key as string] = v;
  }
  return next;
}

export function useTlsOverviewFilters() {
  const location = useLocation();
  const history = useHistory();

  const [filters, setFilters] = React.useState<TlsOverviewFilters>(() =>
    readFromSearch(location.search),
  );

  React.useEffect(() => {
    const fromUrl = readFromSearch(location.search);
    setFilters((prev) => {
      const same = PARAM_MAP.every(([k]) => prev[k] === fromUrl[k]);
      return same ? prev : fromUrl;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const applyOne = React.useCallback(
    <K extends keyof TlsOverviewFilters>(key: K, value: TlsOverviewFilters[K]) => {
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
    history.replace({ pathname: location.pathname, search: '' });
  }, [history, location.pathname]);

  return { filters, applyOne, clearAll };
}
