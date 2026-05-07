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
