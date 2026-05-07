import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface K8sCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
  observedGeneration?: number;
}

export type StatusSeverity = 'healthy' | 'warning' | 'critical' | 'unknown' | 'progressing';

export interface PolicyTargetReference {
  group: string;
  kind: string;
  name: string;
  namespace?: string;
}

export interface K8sResourceWithConditions extends K8sResourceCommon {
  status?: {
    conditions?: K8sCondition[];
  };
}
