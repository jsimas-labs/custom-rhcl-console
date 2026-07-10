import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { usePluginConfig } from '../../utils/pluginConfig';
import { DnsResolver, StepStatus } from './types';

/**
 * Bridges the DNS Troubleshooting page to the external DNS Prober
 * companion service. The prober lives in the customer cluster (see
 * `rhcl-lab/apps/backend/dns-prober` for the reference implementation)
 * and is deliberately NOT bundled with the plugin — DNS resolution
 * doesn't work from a browser sandbox, so real cross-resolver checks
 * require a cluster-side helper.
 *
 * Contract with the prober:
 *
 *   POST <dnsProberUrl>/api/probe
 *   Content-Type: application/json
 *   Body: { hostname: string, resolvers?: Array<{ name, ip }> }
 *   → 200 { hostname, results: Array<ProberResult> }
 *
 * `resolvers` is optional; when omitted the prober uses its own
 * default set. The plugin sends the same 8-resolver ladder the
 * simulated fallback uses so the table stays consistent across the two
 * paths.
 *
 * States the caller sees:
 *
 *   - `configured: false` → the plugin config has no dnsProberUrl.
 *     Renderer shows the "install the prober" callout.
 *   - `configured: true, loading: true` → prober is being called.
 *   - `configured: true, error: X` → prober is unreachable or errored.
 *     Renderer shows the error inline and falls back to the simulated
 *     view so the page never goes completely blank.
 *   - `configured: true, resolvers: [...]` → real data ready.
 */

interface ProberResult {
  resolver: string;
  status: string;
  answer: string;
  latencyMs?: number;
  probedAt?: string;
}

interface ProberResponse {
  hostname: string;
  results: ProberResult[];
}

export interface UseDnsProberResult {
  configured: boolean;
  loading: boolean;
  error: string | null;
  resolvers: DnsResolver[] | null;
  /** Rough "last probed" stamp — refreshes on every successful call. */
  probedAt: string | null;
}

/** The default resolver ladder we send to the prober. Kept in sync with
 *  the simulated one in `useDnsTroubleshooting.synthResolvers` so the
 *  table doesn't visibly reorder when the operator toggles the prober
 *  on later. */
const DEFAULT_RESOLVERS = [
  { name: 'Cloudflare', ip: '1.1.1.1', location: 'Global' },
  { name: 'Google', ip: '8.8.8.8', location: 'Global' },
  { name: 'Quad9', ip: '9.9.9.9', location: 'Global' },
  { name: 'OpenDNS', ip: '208.67.222.222', location: 'Global' },
  { name: 'Verisign', ip: '64.6.64.6', location: 'US' },
  { name: 'Cisco OpenDNS', ip: '208.67.220.220', location: 'US' },
  { name: 'AdGuard', ip: '94.140.14.14', location: 'EU' },
  { name: 'Yandex', ip: '77.88.8.8', location: 'RU' },
];

/** Normalise the prober's status string to the StepStatus enum used
 *  across the page. */
function toStepStatus(s: string): StepStatus {
  const lower = (s || '').toLowerCase();
  if (lower === 'healthy' || lower === 'ok' || lower === 'noerror') return 'healthy';
  if (lower === 'pending' || lower === 'servfail' || lower === 'timeout') return 'pending';
  if (lower === 'failing' || lower === 'nxdomain' || lower === 'refused' || lower === 'error') return 'failing';
  return 'unknown';
}

/**
 * @param hostname current selection from the page dropdown
 * @param nonce    bump to force a fresh POST /api/probe even when the
 *                 hostname hasn't changed. Wired to the page's Refresh
 *                 and Run-all-checks buttons.
 */
export function useDnsProber(hostname: string | null, nonce: number = 0): UseDnsProberResult {
  const { config } = usePluginConfig();
  const proberUrl = config.dnsProberUrl?.trim();
  const configured = !!proberUrl;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resolvers, setResolvers] = React.useState<DnsResolver[] | null>(null);
  const [probedAt, setProbedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!configured || !hostname) {
      setResolvers(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Trim trailing slash so the concat below always produces the same
    // absolute URL regardless of how the operator wrote the config
    // value ("https://...prober" vs "https://...prober/").
    const base = proberUrl.replace(/\/+$/, '');
    (async () => {
      try {
        const res = await consoleFetch(`${base}/api/probe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostname,
            resolvers: DEFAULT_RESOLVERS.map((r) => ({ name: r.name, ip: r.ip })),
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const body = (await res.json()) as ProberResponse;
        if (cancelled) return;
        const mapped: DnsResolver[] = body.results.map((r) => {
          const meta = DEFAULT_RESOLVERS.find((d) => d.name === r.resolver);
          return {
            name: r.resolver,
            location: meta?.location || 'Unknown',
            ip: meta?.ip || '',
            status: toStepStatus(r.status),
            result: r.answer,
            latencyMs: r.latencyMs,
            lastCheckedIso: r.probedAt || new Date().toISOString(),
          };
        });
        setResolvers(mapped);
        setProbedAt(new Date().toISOString());
      } catch (e) {
        if (cancelled) return;
        setError((e as Error)?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [proberUrl, configured, hostname, nonce]);

  return { configured, loading, error, resolvers, probedAt };
}
