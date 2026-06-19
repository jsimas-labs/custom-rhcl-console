import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition } from './common';

export interface APIProductDocumentation {
  url?: string;
  swaggerUI?: string;
  gitRepository?: string;
}

export interface APIProductContact {
  team?: string;
  email?: string;
  url?: string;
}

export interface APIProductTargetRef {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
}

export interface DiscoveredPlan {
  tier: string;
  limits?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    yearly?: number;
  };
}

export interface DiscoveredAuthScheme {
  authentication?: Record<string, {
    apiKey?: unknown;
    jwt?: unknown;
    oidc?: unknown;
    anonymous?: unknown;
  }>;
  credentials?: {
    authorizationHeader?: { prefix?: string };
    customHeader?: { name: string };
    queryString?: { name: string };
    cookie?: { name: string };
  };
}

export interface APIProduct extends K8sResourceCommon {
  spec: {
    displayName?: string;
    description?: string;
    version?: string;
    tags?: string[];
    publishStatus?: 'Published' | 'Draft';
    approvalMode?: 'automatic' | 'manual';
    targetRef?: APIProductTargetRef;
    documentation?: APIProductDocumentation;
    contact?: APIProductContact;
  };
  status?: {
    conditions?: K8sCondition[];
    discoveredPlans?: DiscoveredPlan[];
    discoveredAuthScheme?: DiscoveredAuthScheme;
    resolvedAddress?: string;
  };
}

// devportal.kuadrant.io/v1alpha1 — APIKey CR.
//
// Phase is NOT a top-level status field anymore (it was on early CRD
// revisions; the v1alpha1 schema we ship against now reports phase via
// `status.conditions[*]` where exactly one condition with status=True
// represents the current phase). `getAPIKeyPhase` below is the canonical
// reader — never rely on `status.phase`.
export interface APIKey extends K8sResourceCommon {
  spec: {
    apiProductRef: {
      name: string;
    };
    planTier: string;
    requestedBy: {
      userId: string;
      email: string;
    };
    secretRef?: {
      name: string;
    };
    useCase: string;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

// devportal.kuadrant.io/v1alpha1 — APIKeyRequest CR.
//
// Auto-created by the devportal controller when an APIKey is declared.
// Acts as the request envelope that approvals point at — APIKeyApproval
// references *this* (not the APIKey directly), so the workflow can model
// re-approvals/audit history per request.
export interface APIKeyRequest extends K8sResourceCommon {
  spec: {
    apiKeyRef: {
      name: string;
      namespace: string;
    };
    apiProductRef: {
      name: string;
    };
    planTier: string;
    requestedBy: {
      userId: string;
      email: string;
    };
    useCase?: string;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

// devportal.kuadrant.io/v1alpha1 — APIKeyApproval CR.
//
// Created (one per review action) to approve or reject an APIKeyRequest.
// The devportal controller watches these and updates the corresponding
// APIKey's status.conditions accordingly. Approving twice creates two
// APIKeyApprovals — the controller's last-wins semantics keep the final
// state aligned with the most recent reviewedAt timestamp.
export interface APIKeyApproval extends K8sResourceCommon {
  spec: {
    apiKeyRequestRef: {
      name: string;
    };
    approved: boolean;
    reviewedAt: string;        // RFC3339 — controller validates
    reviewedBy: string;
    reason?: string;
    message?: string;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}

// Phase reader. Walks status.conditions and returns the first type whose
// status is "True". Defaults to "Pending" when no condition is set yet
// (the controller hasn't observed the resource), which matches what the
// upstream Kuadrant console plugin does and what an operator expects to
// see in the moment a request lands.
//
// Note the controller emits `Denied` (not `Rejected`) when an
// APIKeyApproval with `approved: false` is observed. We normalise that to
// the UI label `Rejected` because users read the row through the
// Approve/Reject button pair — calling the same outcome two different
// names across the schema and the UI breaks the user mental model and
// also re-enables the Reject button (the row stays "Pending" from the
// UI's perspective and the operator clicks again, creating more
// APIKeyApproval CRs the controller has to dedupe).
export function getAPIKeyPhase(key: APIKey): 'Pending' | 'Approved' | 'Rejected' {
  const conditions = key.status?.conditions ?? [];
  for (const c of conditions) {
    if (c.status !== 'True') continue;
    if (c.type === 'Approved' || c.type === 'Pending') return c.type;
    if (c.type === 'Rejected' || c.type === 'Denied') return 'Rejected';
  }
  return 'Pending';
}

// PlanPolicy moved to ./policies.ts (canonical extensions.kuadrant.io/v1alpha1
// shape with spec.plans[].tier/predicate/limits). The placeholder that used
// to live here had speculative fields that didn't match the real CRD.
