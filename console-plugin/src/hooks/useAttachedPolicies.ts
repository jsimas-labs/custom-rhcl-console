import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
} from '../models';
import {
  AnyPolicy,
  AuthPolicy,
  RateLimitPolicy,
  TokenRateLimitPolicy,
  DNSPolicy,
  TLSPolicy,
  PolicyAttachment,
  PolicyKind,
  PolicyTargetReference,
} from '../types';

interface UseAttachedPoliciesResult {
  policies: PolicyAttachment[];
  loaded: boolean;
  error: Error | undefined;
}

export function useAttachedPolicies(
  targetKind: string,
  targetName: string,
  targetNamespace: string,
): UseAttachedPoliciesResult {
  const [authPolicies, authLoaded, authErr] = useK8sWatchResource<AuthPolicy[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
    namespace: targetNamespace,
  });

  const [rlPolicies, rlLoaded, rlErr] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
    namespace: targetNamespace,
  });

  const [trlPolicies, trlLoaded, trlErr] = useK8sWatchResource<TokenRateLimitPolicy[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
    namespace: targetNamespace,
  });

  const [dnsPolicies, dnsLoaded, dnsErr] = useK8sWatchResource<DNSPolicy[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
    namespace: targetNamespace,
  });

  const [tlsPolicies, tlsLoaded, tlsErr] = useK8sWatchResource<TLSPolicy[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
    namespace: targetNamespace,
  });

  const loaded = authLoaded && rlLoaded && trlLoaded && dnsLoaded && tlsLoaded;
  const errors = [authErr, rlErr, trlErr, dnsErr, tlsErr].filter(Boolean);
  const error = errors.length === 5 ? errors[0] : undefined;

  const policies: PolicyAttachment[] = [];

  const addMatching = (
    items: AnyPolicy[],
    kind: PolicyKind,
  ) => {
    for (const p of items || []) {
      const ref = (p.spec as { targetRef: PolicyTargetReference }).targetRef;
      if (!matchesTarget(ref, targetKind, targetName, targetNamespace)) continue;

      const conditions = p.status?.conditions || [];
      const isOverridden = conditions.some(
        (c) => c.type === 'Overridden' && c.status === 'True',
      );
      const isEnforced = conditions.some(
        (c) => c.type === 'Enforced' && c.status === 'True',
      );

      policies.push({
        policy: p,
        policyKind: kind,
        targetRef: ref,
        conditions,
        isOverridden,
        isEnforced,
      });
    }
  };

  addMatching(authPolicies, 'AuthPolicy');
  addMatching(rlPolicies, 'RateLimitPolicy');
  addMatching(trlPolicies, 'TokenRateLimitPolicy');
  addMatching(dnsPolicies, 'DNSPolicy');
  addMatching(tlsPolicies, 'TLSPolicy');

  return { policies, loaded, error };
}

function matchesTarget(
  ref: PolicyTargetReference,
  kind: string,
  name: string,
  namespace: string,
): boolean {
  if (ref.name !== name) return false;
  if (ref.kind && ref.kind !== kind) return false;
  if (ref.namespace && ref.namespace !== namespace) return false;
  return true;
}
