import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition } from './common';

export interface ParentReference {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
  sectionName?: string;
  port?: number;
}

export interface HTTPPathMatch {
  type?: 'Exact' | 'PathPrefix' | 'RegularExpression';
  value?: string;
}

export interface HTTPHeaderMatch {
  type?: 'Exact' | 'RegularExpression';
  name: string;
  value: string;
}

export interface HTTPRouteMatch {
  path?: HTTPPathMatch;
  headers?: HTTPHeaderMatch[];
  queryParams?: { type?: string; name: string; value: string }[];
  method?: string;
}

export interface HTTPBackendRef {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
  port?: number;
  weight?: number;
}

export interface HTTPRouteFilter {
  type: string;
  requestHeaderModifier?: {
    set?: { name: string; value: string }[];
    add?: { name: string; value: string }[];
    remove?: string[];
  };
  requestRedirect?: {
    scheme?: string;
    hostname?: string;
    path?: { type: string; value: string };
    port?: number;
    statusCode?: number;
  };
  urlRewrite?: {
    hostname?: string;
    path?: { type: string; value: string };
  };
}

export interface HTTPRouteRule {
  matches?: HTTPRouteMatch[];
  filters?: HTTPRouteFilter[];
  backendRefs?: HTTPBackendRef[];
}

export interface RouteParentStatus {
  parentRef: ParentReference;
  controllerName: string;
  conditions: K8sCondition[];
}

export interface HTTPRoute extends K8sResourceCommon {
  spec: {
    parentRefs?: ParentReference[];
    hostnames?: string[];
    rules?: HTTPRouteRule[];
  };
  status?: {
    parents?: RouteParentStatus[];
  };
}
