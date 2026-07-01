/**
 * Shared types for the operational policy detail pages.
 *
 * Every Kuadrant policy kind (AuthPolicy, RateLimitPolicy,
 * TokenRateLimitPolicy, DNSPolicy, TLSPolicy) renders the same outer
 * layout (Header → Summary + Status + Configuration + Metrics on the
 * left, Target + Affected + Troubleshooting + Events on the right).
 * The shared cards consume the same minimal projection of a policy so
 * we don't have to thread one shape per kind into every card.
 */
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition, PolicyTargetReference } from '../../../types/common';

export type PolicyKind =
  | 'AuthPolicy'
  | 'RateLimitPolicy'
  | 'TokenRateLimitPolicy'
  | 'DNSPolicy'
  | 'TLSPolicy';

/**
 * Discrete operational status — drives the badge colour in the header
 * and the troubleshooting card visibility. `healthy` means Accepted +
 * Enforced; `progressing` means a controller transition in flight;
 * `degraded` covers Accepted=False, Enforced=False, or any other
 * failed/warning condition; `unknown` is the "controller hasn't
 * touched this yet" case.
 */
export type PolicyOperationalState =
  | 'healthy'
  | 'progressing'
  | 'degraded'
  | 'unknown';

/**
 * Minimal shape every shared card needs. Concrete policies extend this
 * (their `spec` is a `Record<string, unknown>` here; per-kind cards cast
 * to the right interface from `src/types/policies`).
 */
export interface PolicyResource extends K8sResourceCommon {
  spec?: Record<string, unknown> & {
    targetRef?: PolicyTargetReference;
    targetRefs?: PolicyTargetReference[];
  };
  status?: {
    conditions?: K8sCondition[];
  };
}
