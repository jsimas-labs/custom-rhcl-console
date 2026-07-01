import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
  policyKindLabel,
  policyResourceURL,
} from '../models';
import { primaryTargetRef } from '../utils/policyTargets';
import { PolicyImpactRow } from '../components/overview/types';

interface StatusCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  reason?: string;
}
interface PolicyResource extends K8sResourceCommon {
  status?: { conditions?: StatusCondition[] };
}

function policyStatus(p: PolicyResource): PolicyImpactRow['status'] {
  const conds = p.status?.conditions || [];
  const accepted = conds.find((c) => c.type === 'Accepted');
  const enforced = conds.find((c) => c.type === 'Enforced');
  if (accepted?.status === 'True' && accepted.reason === 'Overridden') return 'overridden';
  if (enforced?.status === 'True') return 'enforced';
  if (accepted?.status === 'True') return 'accepted';
  return 'failed';
}

interface UsePolicyImpactRowsResult {
  rows: PolicyImpactRow[];
  loaded: boolean;
}

/**
 * Watches the 5 known policy kinds, projects each into a `PolicyImpactRow`
 * for the Overview "Policies" table. `impact` is a short human-readable
 * sentence that depends on the status:
 *
 *   - enforced  → "Targeting <kind>/<name>"
 *   - accepted  → "Accepted, no enforcement"  (waiting / no target traffic)
 *   - overridden → "Overridden by route policy"
 *   - failed    → "Not accepted"
 *
 * Sort is critical → warning → healthy so the row that needs eyeballs is at
 * the top (matches the Needs Attention ordering).
 */
export function usePolicyImpactRows(): UsePolicyImpactRowsResult {
  const [authP, authLoaded] = useK8sWatchResource<PolicyResource[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
  });
  const [rlp, rlpLoaded] = useK8sWatchResource<PolicyResource[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
  });
  const [trlp, trlpLoaded] = useK8sWatchResource<PolicyResource[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
  });
  const [dnsP, dnsLoaded] = useK8sWatchResource<PolicyResource[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
  });
  const [tlsP, tlsLoaded] = useK8sWatchResource<PolicyResource[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
  });

  return React.useMemo<UsePolicyImpactRowsResult>(() => {
    const loaded =
      authLoaded && rlpLoaded && trlpLoaded && dnsLoaded && tlsLoaded;

    type PolicyEntry = { p: PolicyResource; kind: string };
    const entries: PolicyEntry[] = [
      ...(authP || []).map((p) => ({ p, kind: 'AuthPolicy' })),
      ...(rlp || []).map((p) => ({ p, kind: 'RateLimitPolicy' })),
      ...(trlp || []).map((p) => ({ p, kind: 'TokenRateLimitPolicy' })),
      ...(dnsP || []).map((p) => ({ p, kind: 'DNSPolicy' })),
      ...(tlsP || []).map((p) => ({ p, kind: 'TLSPolicy' })),
    ];

    const rows: PolicyImpactRow[] = entries.map(({ p, kind }) => {
      const ns = p.metadata?.namespace || '';
      const name = p.metadata?.name || '';
      const status = policyStatus(p);
      const ref = primaryTargetRef(p);
      let impact = '';
      if (ref) {
        switch (status) {
          case 'enforced':
            impact = `Targeting ${ref.kind}/${ref.name}`;
            break;
          case 'accepted':
            impact = 'Accepted, no enforcement';
            break;
          case 'overridden':
            impact = 'Overridden by route policy';
            break;
          case 'failed':
          default:
            impact = 'Not accepted';
        }
      } else {
        impact = 'No target attached';
      }

      return {
        id: `${kind}-${ns}-${name}`,
        name,
        namespace: ns,
        kind,
        typeLabel: policyKindLabel(kind),
        status,
        impact,
        href: policyResourceURL(kind, ns, name),
      };
    });

    const rank: Record<PolicyImpactRow['status'], number> = {
      failed: 0,
      accepted: 1,
      overridden: 2,
      enforced: 3,
    };
    rows.sort((a, b) => rank[a.status] - rank[b.status]);

    return { rows, loaded };
  }, [authP, rlp, trlp, dnsP, tlsP, authLoaded, rlpLoaded, trlpLoaded, dnsLoaded, tlsLoaded]);
}
