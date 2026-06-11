import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DNSPolicyGVK, DNSRecordGVK } from '../models';
import { DNSPolicy, DNSRecord } from '../types';
import { policyAttachesTo } from '../utils/policyTargets';

interface DNSHealthEntry {
  dnsPolicy: DNSPolicy;
  dnsRecords: DNSRecord[];
  managedZone: string | undefined;
  propagationHealthy: boolean;
}

interface UseDNSRecordsResult {
  entries: DNSHealthEntry[];
  loaded: boolean;
  error: Error | undefined;
}

export function useDNSRecordsForGateway(
  gatewayName: string,
  namespace: string,
): UseDNSRecordsResult {
  const [dnsPolicies, policiesLoaded, policiesErr] = useK8sWatchResource<DNSPolicy[]>({
    groupVersionKind: DNSPolicyGVK,
    isList: true,
    namespace,
  });

  const [dnsRecords, recordsLoaded, recordsErr] = useK8sWatchResource<DNSRecord[]>({
    groupVersionKind: DNSRecordGVK,
    isList: true,
    namespace,
  });

  const loaded = policiesLoaded && recordsLoaded;
  const error = policiesErr || recordsErr;

  // Handles both spec.targetRefs[] (GEP-2649) and legacy spec.targetRef. Falls
  // back to the policy's own namespace when the ref omits one (Gateway API
  // semantics) — matches the behaviour of policyAttachesTo across the codebase.
  const matchingPolicies = (dnsPolicies || []).filter((p) =>
    policyAttachesTo(p, 'Gateway', gatewayName, namespace),
  );

  const entries: DNSHealthEntry[] = matchingPolicies.map((policy) => {
    const ownerName = policy.metadata?.name || '';
    const relatedRecords = (dnsRecords || []).filter((r) => {
      const owners = r.metadata?.ownerReferences || [];
      return owners.some((o) => o.name === ownerName && o.kind === 'DNSPolicy');
    });

    const managedZone = relatedRecords[0]?.status?.zoneDomainName || undefined;

    const propagationHealthy = relatedRecords.every((r) => {
      const readyCondition = r.status?.conditions?.find((c) => c.type === 'Ready');
      return readyCondition?.status === 'True';
    });

    return {
      dnsPolicy: policy,
      dnsRecords: relatedRecords,
      managedZone,
      propagationHealthy,
    };
  });

  return { entries, loaded, error };
}
