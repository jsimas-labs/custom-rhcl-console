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
    useCase: string;
  };
  status?: {
    conditions?: K8sCondition[];
    phase?: 'Pending' | 'Approved' | 'Rejected';
    reviewedAt?: string;
    reviewedBy?: string;
  };
}

export interface PlanPolicy extends K8sResourceCommon {
  spec: {
    displayName?: string;
    rateLimits?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
}
