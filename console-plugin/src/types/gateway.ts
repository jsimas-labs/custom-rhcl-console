import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition } from './common';

export interface GatewayTLSConfig {
  mode?: 'Terminate' | 'Passthrough';
  certificateRefs?: {
    group?: string;
    kind?: string;
    name: string;
    namespace?: string;
  }[];
}

export interface AllowedRoutes {
  namespaces?: {
    from?: 'All' | 'Same' | 'Selector';
    selector?: {
      matchLabels?: Record<string, string>;
      matchExpressions?: {
        key: string;
        operator: string;
        values?: string[];
      }[];
    };
  };
  kinds?: {
    group?: string;
    kind: string;
  }[];
}

export interface GatewayListener {
  name: string;
  hostname?: string;
  port: number;
  protocol: string;
  tls?: GatewayTLSConfig;
  allowedRoutes?: AllowedRoutes;
}

export interface GatewayAddress {
  type?: 'IPAddress' | 'Hostname';
  value: string;
}

export interface ListenerStatus {
  name: string;
  supportedKinds: { group?: string; kind: string }[];
  attachedRoutes: number;
  conditions: K8sCondition[];
}

export interface GatewayStatusAddress {
  type: 'IPAddress' | 'Hostname';
  value: string;
}

export interface Gateway extends K8sResourceCommon {
  spec: {
    gatewayClassName: string;
    listeners: GatewayListener[];
    addresses?: GatewayAddress[];
  };
  status?: {
    conditions?: K8sCondition[];
    listeners?: ListenerStatus[];
    addresses?: GatewayStatusAddress[];
  };
}

export interface GatewayClass extends K8sResourceCommon {
  spec: {
    controllerName: string;
    description?: string;
  };
  status?: {
    conditions?: K8sCondition[];
  };
}
