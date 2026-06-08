import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// Minimal subset of core/v1 Service + discovery.k8s.io/v1 EndpointSlice
// that this plugin's backend status feature consumes. We avoid pulling in
// the full @kubernetes/client-node types because the SDK doesn't ship them
// and we only read a handful of fields.

export interface ServicePort {
  name?: string;
  port: number;
  targetPort?: number | string;
  protocol?: string;
  appProtocol?: string;
}

export interface Service extends K8sResourceCommon {
  spec: {
    type?: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
    clusterIP?: string;
    selector?: Record<string, string>;
    ports?: ServicePort[];
  };
}

export interface EndpointSliceEndpoint {
  addresses?: string[];
  conditions?: {
    ready?: boolean;
    serving?: boolean;
    terminating?: boolean;
  };
  targetRef?: {
    kind?: string;
    name?: string;
    namespace?: string;
    uid?: string;
  };
  hostname?: string;
  nodeName?: string;
}

export interface EndpointSlice extends K8sResourceCommon {
  addressType?: 'IPv4' | 'IPv6' | 'FQDN';
  endpoints?: EndpointSliceEndpoint[];
  ports?: ServicePort[];
}

// "Resolved" interpretation of a single HTTPRoute backendRef.
// The hook layer enriches the raw spec.backendRefs[] entry with the watched
// Service + EndpointSlices so the UI doesn't have to do its own joins.
export interface ResolvedBackend {
  name: string;
  namespace: string;
  port?: number;
  weight: number;
  // ResolvedRefs condition on the route — null if route status not yet observed.
  resolvedRefs: boolean | null;
  // The Service was found via watch (vs ResolvedRefs which is what the gateway
  // controller asserted at last reconcile). May briefly disagree under load —
  // we surface both so the UI can flag the inconsistency.
  serviceFound: boolean;
  service: Service | null;
  readyEndpoints: number;
  totalEndpoints: number;
  podNames: string[];
}
