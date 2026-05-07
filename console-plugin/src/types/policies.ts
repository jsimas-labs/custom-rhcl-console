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
    targetRef: PolicyTargetReference;
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
    targetRef: PolicyTargetReference;
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
    targetRef: PolicyTargetReference;
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
    targetRef: PolicyTargetReference;
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
    targetRef: PolicyTargetReference;
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

export type AnyPolicy =
  | AuthPolicy
  | RateLimitPolicy
  | TokenRateLimitPolicy
  | DNSPolicy
  | TLSPolicy;

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
