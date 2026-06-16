import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

export const GatewayGVK: K8sGroupVersionKind = {
  group: 'gateway.networking.k8s.io',
  version: 'v1',
  kind: 'Gateway',
};

export const GatewayClassGVK: K8sGroupVersionKind = {
  group: 'gateway.networking.k8s.io',
  version: 'v1',
  kind: 'GatewayClass',
};

export const HTTPRouteGVK: K8sGroupVersionKind = {
  group: 'gateway.networking.k8s.io',
  version: 'v1',
  kind: 'HTTPRoute',
};

export const AuthPolicyGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1',
  kind: 'AuthPolicy',
};

export const RateLimitPolicyGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1',
  kind: 'RateLimitPolicy',
};

export const TokenRateLimitPolicyGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1alpha1',
  kind: 'TokenRateLimitPolicy',
};

export const DNSPolicyGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1',
  kind: 'DNSPolicy',
};

export const TLSPolicyGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1',
  kind: 'TLSPolicy',
};

export const DNSRecordGVK: K8sGroupVersionKind = {
  group: 'kuadrant.io',
  version: 'v1alpha1',
  kind: 'DNSRecord',
};

export const CertificateGVK: K8sGroupVersionKind = {
  group: 'cert-manager.io',
  version: 'v1',
  kind: 'Certificate',
};

export const ServiceGVK: K8sGroupVersionKind = {
  group: '',
  version: 'v1',
  kind: 'Service',
};

export const EndpointSliceGVK: K8sGroupVersionKind = {
  group: 'discovery.k8s.io',
  version: 'v1',
  kind: 'EndpointSlice',
};

export const APIProductGVK: K8sGroupVersionKind = {
  group: 'devportal.kuadrant.io',
  version: 'v1alpha1',
  kind: 'APIProduct',
};

export const APIKeyGVK: K8sGroupVersionKind = {
  group: 'devportal.kuadrant.io',
  version: 'v1alpha1',
  kind: 'APIKey',
};

// devportal.kuadrant.io/v1alpha1 — auto-created by the controller; the
// review/approval workflow points at *this*, not at APIKey directly.
export const APIKeyRequestGVK: K8sGroupVersionKind = {
  group: 'devportal.kuadrant.io',
  version: 'v1alpha1',
  kind: 'APIKeyRequest',
};

// devportal.kuadrant.io/v1alpha1 — created by the operator (or via this
// plugin) every time an APIKeyRequest is approved or rejected.
export const APIKeyApprovalGVK: K8sGroupVersionKind = {
  group: 'devportal.kuadrant.io',
  version: 'v1alpha1',
  kind: 'APIKeyApproval',
};

/**
 * The set of policy GVKs for which the console ships **specialized renderers**
 * (TLS expiry card, rate-limit RPS panel, etc.). This is NOT an exhaustive
 * inventory of attachable policies — for runtime enumeration of every policy
 * CRD on the cluster (BackendTLSPolicy on OCP 4.22, any future Kuadrant
 * policy), use `useDiscoveredPolicyCRDs()` which follows the Gateway API
 * GEP-713 label convention. New code that needs "every attached policy"
 * SHOULD call the discovery hook and treat unknown kinds via the
 * `GenericPolicy` renderer.
 */
export const ALL_POLICY_GVKS = [
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
];

export const POLICY_KIND_LABELS: Record<string, string> = {
  AuthPolicy: 'Auth',
  RateLimitPolicy: 'Rate Limit',
  TokenRateLimitPolicy: 'Token Rate Limit',
  DNSPolicy: 'DNS',
  TLSPolicy: 'TLS',
};

/**
 * Resolve the display label for a policy kind. Returns the curated short
 * label when one is registered in POLICY_KIND_LABELS (the 5 specialized
 * kinds) and falls back to the raw kind name for everything else — so
 * policies discovered at runtime (e.g. BackendTLSPolicy) get a sane label
 * without any further registration.
 */
export function policyKindLabel(kind: string): string {
  return POLICY_KIND_LABELS[kind] || kind;
}

const POLICY_KIND_TO_GVK: Record<string, K8sGroupVersionKind> = {
  AuthPolicy: AuthPolicyGVK,
  RateLimitPolicy: RateLimitPolicyGVK,
  TokenRateLimitPolicy: TokenRateLimitPolicyGVK,
  DNSPolicy: DNSPolicyGVK,
  TLSPolicy: TLSPolicyGVK,
};

export function policyResourceURL(policyKind: string, namespace: string, name: string): string {
  const gvk = POLICY_KIND_TO_GVK[policyKind];
  if (!gvk) return '#';
  return `/k8s/ns/${namespace}/${gvk.group}~${gvk.version}~${gvk.kind}/${name}`;
}
