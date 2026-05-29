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
