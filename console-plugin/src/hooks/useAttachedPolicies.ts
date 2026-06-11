import {
  K8sResourceCommon,
  WatchK8sResources,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
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
  GenericPolicy,
  PolicyAttachment,
  PolicyKind,
  SpecializedPolicyKind,
  isSpecializedPolicyKind,
} from '../types';
import { policyAttachesTo, primaryTargetRef } from '../utils/policyTargets';
import { useDiscoveredPolicyCRDs, DiscoveredPolicyCRD } from './useDiscoveredPolicyCRDs';

interface UseAttachedPoliciesResult {
  policies: PolicyAttachment[];
  loaded: boolean;
  error: Error | undefined;
}

/**
 * Discover policies attached to a Gateway API target (Gateway or HTTPRoute).
 *
 * Two layers:
 *
 * 1. **Specialized watches** for the five policy kinds the console has
 *    first-class knowledge of (`AuthPolicy`, `RateLimitPolicy`,
 *    `TokenRateLimitPolicy`, `DNSPolicy`, `TLSPolicy`). These run twice —
 *    once in the target's namespace and once in `gatewayNamespace` — and
 *    are de-duplicated by UID. Gateway-level policies that live in a
 *    different namespace than an HTTPRoute (the typical
 *    `openshift-ingress` → `rhcl-apps` shape) surface correctly.
 *
 * 2. **Discovered watches** for every other CRD that carries the GEP-713
 *    label `gateway.networking.k8s.io/policy`. Wired through the SDK's
 *    `useK8sWatchResources` (dynamic map of resource specs), keyed by
 *    `<kind>-target` / `<kind>-alt`. Any policy that lands on the cluster
 *    later — `BackendTLSPolicy` on OCP 4.22, any future Kuadrant policy —
 *    appears here without any code change in this hook.
 *
 * Attachment is evaluated via `policyAttachesTo`, which understands both
 * `spec.targetRefs[]` (GEP-2649) and the legacy singular `spec.targetRef`.
 */
export function useAttachedPolicies(
  targetKind: string,
  targetName: string,
  targetNamespace: string,
  gatewayNamespace?: string,
): UseAttachedPoliciesResult {
  // Resolve the secondary namespace once. When the caller passes a Gateway ns
  // that equals the target ns (or omits it), we still call the same hooks so
  // React's hook-order rule is preserved; the dedup-by-UID below collapses
  // the duplicates.
  const altNs = gatewayNamespace && gatewayNamespace !== targetNamespace
    ? gatewayNamespace
    : targetNamespace;

  // -------------------------------------------------------------------------
  // Specialized watches — target namespace
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Specialized watches — alt (Gateway) namespace
  // -------------------------------------------------------------------------
  const [authPoliciesAlt, authLoadedAlt, authErrAlt] = useK8sWatchResource<AuthPolicy[]>({
    groupVersionKind: AuthPolicyGVK,
    isList: true,
    namespace: altNs,
  });
  const [rlPoliciesAlt, rlLoadedAlt, rlErrAlt] = useK8sWatchResource<RateLimitPolicy[]>({
    groupVersionKind: RateLimitPolicyGVK,
    isList: true,
    namespace: altNs,
  });
  const [trlPoliciesAlt, trlLoadedAlt, trlErrAlt] = useK8sWatchResource<TokenRateLimitPolicy[]>({
    groupVersionKind: TokenRateLimitPolicyGVK,
    isList: true,
    namespace: altNs,
  });
  const [dnsPoliciesAlt, dnsLoadedAlt, dnsErrAlt] = useK8sWatchResource<DNSPolicy[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
    namespace: altNs,
  });
  const [tlsPoliciesAlt, tlsLoadedAlt, tlsErrAlt] = useK8sWatchResource<TLSPolicy[]>({
    groupVersionKind: TLSPolicyGVK,
    isList: true,
    namespace: altNs,
  });

  // -------------------------------------------------------------------------
  // Discovery layer — GEP-713 CRDs that are NOT one of the specialized kinds.
  // Builds a dynamic WatchK8sResources map and lets the SDK manage the fan-out.
  // -------------------------------------------------------------------------
  const {
    crds: discoveredCRDs,
    loaded: discoveryLoaded,
    error: discoveryErr,
  } = useDiscoveredPolicyCRDs();

  const nonSpecializedCRDs: DiscoveredPolicyCRD[] = (discoveredCRDs || []).filter(
    (c) => !isSpecializedPolicyKind(c.kind),
  );

  type DynamicWatchMap = Record<string, K8sResourceCommon[]>;
  const watchMapTarget: WatchK8sResources<DynamicWatchMap> = {};
  const watchMapAlt: WatchK8sResources<DynamicWatchMap> = {};

  for (const crd of nonSpecializedCRDs) {
    const targetKey = `${crd.kind}-target`;
    const altKey = `${crd.kind}-alt`;
    if (crd.scope === 'Cluster') {
      // Cluster-scoped policy CRDs — one watch is enough.
      watchMapTarget[targetKey] = {
        groupVersionKind: crd.gvk,
        isList: true,
      };
    } else {
      watchMapTarget[targetKey] = {
        groupVersionKind: crd.gvk,
        isList: true,
        namespace: targetNamespace,
      };
      watchMapAlt[altKey] = {
        groupVersionKind: crd.gvk,
        isList: true,
        namespace: altNs,
      };
    }
  }

  const discoveredTarget = useK8sWatchResources<DynamicWatchMap>(watchMapTarget);
  const discoveredAlt = useK8sWatchResources<DynamicWatchMap>(watchMapAlt);

  // -------------------------------------------------------------------------
  // Loaded / error aggregation. Partial RBAC errors should NOT blank the
  // view: report an error only when every watch failed.
  // -------------------------------------------------------------------------
  const specializedLoaded =
    authLoaded && rlLoaded && trlLoaded && dnsLoaded && tlsLoaded &&
    authLoadedAlt && rlLoadedAlt && trlLoadedAlt && dnsLoadedAlt && tlsLoadedAlt;

  const discoveredLoaded =
    Object.values(discoveredTarget).every((r) => r.loaded) &&
    Object.values(discoveredAlt).every((r) => r.loaded);

  const loaded = discoveryLoaded && specializedLoaded && discoveredLoaded;

  const specializedErrors = [
    authErr, rlErr, trlErr, dnsErr, tlsErr,
    authErrAlt, rlErrAlt, trlErrAlt, dnsErrAlt, tlsErrAlt,
  ].filter(Boolean);
  const discoveredErrors = [
    ...Object.values(discoveredTarget).map((r) => r.loadError),
    ...Object.values(discoveredAlt).map((r) => r.loadError),
  ].filter(Boolean);

  // Discovery (CRD list) is the foundation — if it fails, surface it.
  const error: Error | undefined = discoveryErr
    ? discoveryErr
    : specializedErrors.length === 10 &&
      // Only flag a blanket error when every specialized watch failed AND
      // there is no discovery data to fall back on.
      discoveredErrors.length > 0
    ? (specializedErrors[0] as Error)
    : undefined;

  // -------------------------------------------------------------------------
  // Aggregate matching policies, dedup by UID.
  // -------------------------------------------------------------------------
  const seen = new Set<string>();
  const policies: PolicyAttachment[] = [];

  const addMatchingSpecialized = (items: AnyPolicy[] | undefined, kind: SpecializedPolicyKind) =>
    addMatching(items, kind, seen, policies, targetKind, targetName, targetNamespace);

  addMatchingSpecialized(authPolicies, 'AuthPolicy');
  addMatchingSpecialized(rlPolicies, 'RateLimitPolicy');
  addMatchingSpecialized(trlPolicies, 'TokenRateLimitPolicy');
  addMatchingSpecialized(dnsPolicies, 'DNSPolicy');
  addMatchingSpecialized(tlsPolicies, 'TLSPolicy');

  addMatchingSpecialized(authPoliciesAlt, 'AuthPolicy');
  addMatchingSpecialized(rlPoliciesAlt, 'RateLimitPolicy');
  addMatchingSpecialized(trlPoliciesAlt, 'TokenRateLimitPolicy');
  addMatchingSpecialized(dnsPoliciesAlt, 'DNSPolicy');
  addMatchingSpecialized(tlsPoliciesAlt, 'TLSPolicy');

  for (const crd of nonSpecializedCRDs) {
    const fromTarget = discoveredTarget[`${crd.kind}-target`]?.data as
      | K8sResourceCommon[]
      | undefined;
    const fromAlt = discoveredAlt[`${crd.kind}-alt`]?.data as K8sResourceCommon[] | undefined;
    addMatching(
      fromTarget as GenericPolicy[] | undefined,
      crd.kind,
      seen,
      policies,
      targetKind,
      targetName,
      targetNamespace,
    );
    addMatching(
      fromAlt as GenericPolicy[] | undefined,
      crd.kind,
      seen,
      policies,
      targetKind,
      targetName,
      targetNamespace,
    );
  }

  return { policies, loaded, error };
}

/**
 * Shared "match + push" logic — kept as a free function so the hook body
 * stays focused on watch wiring. Mutates `seen` and `out` for efficiency
 * (the hook re-creates both on every render anyway).
 */
function addMatching(
  items: (AnyPolicy | GenericPolicy)[] | undefined,
  kind: PolicyKind,
  seen: Set<string>,
  out: PolicyAttachment[],
  targetKind: string,
  targetName: string,
  targetNamespace: string,
): void {
  for (const p of items || []) {
    const uid = p.metadata?.uid;
    if (!uid || seen.has(uid)) continue;
    if (!policyAttachesTo(p, targetKind, targetName, targetNamespace)) continue;
    seen.add(uid);

    const conditions = p.status?.conditions || [];
    const isOverridden = conditions.some(
      (c) => c.type === 'Overridden' && c.status === 'True',
    );
    const isEnforced = conditions.some(
      (c) => c.type === 'Enforced' && c.status === 'True',
    );

    const targetRef = primaryTargetRef(p);
    if (!targetRef) continue;

    out.push({
      policy: p,
      policyKind: kind,
      targetRef,
      conditions,
      isOverridden,
      isEnforced,
    });
  }
}

