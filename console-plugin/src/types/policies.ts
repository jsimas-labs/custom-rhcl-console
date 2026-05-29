import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition, PolicyTargetReference } from './common';

export interface AuthRuleWhen {
  selector: string;
  operator: string;
  value?: string;
}

export interface AuthCredentials {
  authorizationHeader?: {
    prefix?: string;
  };
  customHeader?: {
    name: string;
  };
  queryString?: {
    name: string;
  };
  cookie?: {
    name: string;
  };
}

export interface AuthIdentity {
  apiKey?: {
    selector: {
      matchLabels?: Record<string, string>;
    };
    allNamespaces?: boolean;
  };
  jwt?: {
    issuerUrl?: string;
    audiences?: string[];
  };
  oauth2?: Record<string, unknown>;
  oidc?: {
    endpoint: string;
    credentials?: AuthCredentials;
  };
  anonymous?: Record<string, unknown>;
  kubernetesTokenReview?: {
    audiences?: string[];
  };
  plainIdentity?: {
    selector: string;
  };
  credentials?: AuthCredentials;
  when?: AuthRuleWhen[];
  cache?: { key: { selector: string }; ttl?: number };
}

export interface AuthRules {
  authentication?: Record<string, AuthIdentity>;
  authorization?: Record<string, unknown>;
  response?: Record<string, unknown>;
  callbacks?: Record<string, unknown>;
}

export interface AuthPolicySpec {
  rules?: AuthRules;
  when?: AuthRuleWhen[];
}

export interface AuthPolicy extends K8sResourceCommon {
  spec: {
    // GEP-2649: targetRefs[] is the current Gateway API form. The singular
    // targetRef is retained for back-compat with policies that have not migrated.
    // Callers SHOULD use policyTargetRefs(p) / policyAttachesTo(p, ...) from
    // utils/policyTargets instead of reading either field directly.
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
    defaults?: AuthPolicySpec;
    overrides?: AuthPolicySpec;
    rules?: AuthRules;
    when?: AuthRuleWhen[];
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

export interface RateLimit {
  rates: {
    limit: number;
    window: string;
  }[];
  counters?: string[];
  when?: { selector: string; operator: string; value?: string }[];
}

export interface RateLimitPolicySpec {
  limits?: Record<string, RateLimit>;
  when?: { selector: string; operator: string; value?: string }[];
}

export interface RateLimitPolicy extends K8sResourceCommon {
  spec: {
    // GEP-2649: targetRefs[] is the current Gateway API form. The singular
    // targetRef is retained for back-compat with policies that have not migrated.
    // Callers SHOULD use policyTargetRefs(p) / policyAttachesTo(p, ...) from
    // utils/policyTargets instead of reading either field directly.
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
    defaults?: RateLimitPolicySpec;
    overrides?: RateLimitPolicySpec;
    limits?: Record<string, RateLimit>;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

export interface TokenRateLimitPolicy extends K8sResourceCommon {
  spec: {
    // GEP-2649: targetRefs[] is the current Gateway API form. The singular
    // targetRef is retained for back-compat with policies that have not migrated.
    // Callers SHOULD use policyTargetRefs(p) / policyAttachesTo(p, ...) from
    // utils/policyTargets instead of reading either field directly.
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
    defaults?: {
      limits?: Record<string, { tokens: number; window: string }>;
    };
    overrides?: {
      limits?: Record<string, { tokens: number; window: string }>;
    };
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

export interface DNSPolicy extends K8sResourceCommon {
  spec: {
    // GEP-2649: targetRefs[] is the current Gateway API form. The singular
    // targetRef is retained for back-compat with policies that have not migrated.
    // Callers SHOULD use policyTargetRefs(p) / policyAttachesTo(p, ...) from
    // utils/policyTargets instead of reading either field directly.
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
    providerRefs?: { name: string }[];
    loadBalancing?: {
      geo?: { defaultGeo: string };
      weighted?: { defaultWeight: number };
    };
  };
  status?: {
    conditions?: K8sCondition[];
    recordConditions?: Record<string, K8sCondition[]>;
  };
}

export interface TLSPolicy extends K8sResourceCommon {
  spec: {
    // GEP-2649: targetRefs[] is the current Gateway API form. The singular
    // targetRef is retained for back-compat with policies that have not migrated.
    // Callers SHOULD use policyTargetRefs(p) / policyAttachesTo(p, ...) from
    // utils/policyTargets instead of reading either field directly.
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
    issuerRef?: {
      name: string;
      kind?: string;
      group?: string;
    };
    commonName?: string;
    duration?: string;
    renewBefore?: string;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

/**
 * A policy resource the console did NOT compile-time know about (BackendTLSPolicy
 * on OCP 4.22, any future Kuadrant / Gateway API policy). Discovered at runtime
 * via the GEP-713 CRD label. Carries only the fields every Gateway API policy
 * shares: target references plus standard conditions. Specialized renderers
 * (TLS expiry, DNS propagation, rate-limit RPS, etc.) only apply to the known
 * kinds above; everything else falls back to the generic policy card.
 */
export interface GenericPolicy extends K8sResourceCommon {
  spec?: {
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

export type AnyPolicy =
  | AuthPolicy
  | RateLimitPolicy
  | TokenRateLimitPolicy
  | DNSPolicy
  | TLSPolicy;

/** Discriminator allowing UI components to render either the specialized cards or the generic fallback. */
export type AnyPolicyOrGeneric = AnyPolicy | GenericPolicy;

export type PolicyKind =
  | 'AuthPolicy'
  | 'RateLimitPolicy'
  | 'TokenRateLimitPolicy'
  | 'DNSPolicy'
  | 'TLSPolicy';

export interface PolicyAttachment {
  policy: AnyPolicy;
  policyKind: PolicyKind;
  targetRef: PolicyTargetReference;
  conditions: K8sCondition[];
  isOverridden: boolean;
  isEnforced: boolean;
}
