import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { DNSRecordGVK } from '../../models';
import { PolicyResource } from '../../components/policies/shared/types';
import { K8sCondition } from '../../types';
import { primaryTargetRef } from '../../utils/policyTargets';

interface DNSRecordResource extends K8sResourceCommon {
  spec?: { rootHost?: string };
  status?: { conditions?: K8sCondition[] };
}

export interface DNSPolicyMetrics {
  /** Count of DNSRecord CRs the controller created for this policy's target. */
  records: number;
  /** Records whose Ready=True condition is set. */
  ready: number;
  /** Distinct root hostnames observed. */
  rootHostnames: string[];
  /** True if at least one record reports Ready=False or Failed. */
  hasFailures: boolean;
}

interface Result {
  metrics: DNSPolicyMetrics;
  loaded: boolean;
  metricsAvailable: boolean;
}

/**
 * DNSPolicy doesn't expose Prometheus counters in this stack, but it
 * does control a fleet of DNSRecord CRs the kuadrant dns-operator
 * reconciles against the cloud DNS provider. We surface those as the
 * "runtime" view: how many records exist, how many are reported Ready,
 * and the rootHostnames the policy resolved.
 */
export function useDNSPolicyMetrics(policy: PolicyResource | undefined): Result {
  const [records, loaded] = useK8sWatchResource<DNSRecordResource[]>({
    groupVersionKind: DNSRecordGVK,
    isList: true,
  });

  return React.useMemo<Result>(() => {
    if (!policy) {
      return { metrics: { records: 0, ready: 0, rootHostnames: [], hasFailures: false }, loaded, metricsAvailable: true };
    }
    const ref = primaryTargetRef(policy);
    const targetNs = ref?.namespace || policy.metadata?.namespace;
    // Kuadrant names each DNSRecord after the target Gateway (one record
    // per listener) and creates them in the gateway's namespace. We
    // filter by that namespace and the gateway prefix as a best-effort
    // attribution — strict matching would require parsing
    // ownerReferences across multiple intermediate CRs.
    const matched = (records || []).filter((r) => {
      if (r.metadata?.namespace !== targetNs) return false;
      if (ref?.name && !(r.metadata?.name || '').startsWith(ref.name)) return false;
      return true;
    });
    const ready = matched.filter((r) =>
      (r.status?.conditions || []).some((c) => c.type === 'Ready' && c.status === 'True'),
    ).length;
    const hosts = new Set<string>();
    let hasFailures = false;
    for (const r of matched) {
      if (r.spec?.rootHost) hosts.add(r.spec.rootHost);
      const failed = (r.status?.conditions || []).some(
        (c) =>
          (c.type === 'Ready' && c.status === 'False') ||
          (c.type === 'Failed' && c.status === 'True'),
      );
      if (failed) hasFailures = true;
    }
    return {
      metrics: {
        records: matched.length,
        ready,
        rootHostnames: [...hosts].sort(),
        hasFailures,
      },
      loaded,
      metricsAvailable: true,
    };
  }, [records, loaded, policy]);
}
