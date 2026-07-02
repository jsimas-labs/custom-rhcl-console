import * as React from 'react';
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { CertificateGVK } from '../../models';
import { PolicyResource } from '../../components/policies/shared/types';
import { K8sCondition } from '../../types';
import { primaryTargetRef } from '../../utils/policyTargets';

interface CertificateResource extends K8sResourceCommon {
  spec?: {
    secretName?: string;
    issuerRef?: { name?: string; kind?: string };
    commonName?: string;
    dnsNames?: string[];
  };
  status?: {
    conditions?: K8sCondition[];
    notAfter?: string;
    notBefore?: string;
    renewalTime?: string;
  };
}

export interface CertificateInfo {
  name: string;
  namespace: string;
  issuer: string;
  commonName?: string;
  dnsNames: string[];
  notAfter?: string;
  daysUntilExpiry: number | null;
  ready: boolean;
  // The cert-manager `Ready` condition message — explains in-flight renewals
  // or ACME challenges.
  message: string;
}

export interface TLSPolicyMetrics {
  certificates: CertificateInfo[];
  expiringSoon: number; // any cert with daysUntilExpiry < 14
  failed: number;
}

interface Result {
  metrics: TLSPolicyMetrics;
  loaded: boolean;
  metricsAvailable: boolean;
}

const EXPIRY_WARNING_DAYS = 14;

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((t - Date.now()) / 86400000);
}

/**
 * TLSPolicy delegates the actual TLS work to cert-manager. The
 * "runtime" we care about, then, is the lifecycle of the Certificate
 * CRs that the policy caused cert-manager to create: are they issued,
 * when do they expire, who issued them? Expiry warnings are surfaced
 * as a separate counter so the troubleshooting card can call them out.
 */
export function useTLSPolicyMetrics(policy: PolicyResource | undefined): Result {
  const [certs, loaded] = useK8sWatchResource<CertificateResource[]>({
    groupVersionKind: CertificateGVK,
    isList: true,
  });

  return React.useMemo<Result>(() => {
    if (!policy) {
      return {
        metrics: { certificates: [], expiringSoon: 0, failed: 0 },
        loaded,
        metricsAvailable: true,
      };
    }
    const ref = primaryTargetRef(policy);
    const targetNs = ref?.namespace || policy.metadata?.namespace;
    // cert-manager Certificate CRs land in the gateway's namespace
    // (openshift-ingress for the demo). We attribute them to this
    // TLSPolicy when (a) they live in the same namespace and (b) their
    // name carries the gateway prefix — same heuristic as the DNS hook.
    const matched = (certs || []).filter((c) => {
      if (c.metadata?.namespace !== targetNs) return false;
      if (ref?.name && !(c.metadata?.name || '').includes(ref.name)) return false;
      return true;
    });
    const certificates: CertificateInfo[] = matched.map((c) => {
      const ready = (c.status?.conditions || []).some(
        (cond) => cond.type === 'Ready' && cond.status === 'True',
      );
      const readyCond = (c.status?.conditions || []).find((x) => x.type === 'Ready');
      return {
        name: c.metadata?.name || '',
        namespace: c.metadata?.namespace || '',
        issuer: c.spec?.issuerRef?.name || '—',
        commonName: c.spec?.commonName,
        dnsNames: c.spec?.dnsNames || [],
        notAfter: c.status?.notAfter,
        daysUntilExpiry: daysUntil(c.status?.notAfter),
        ready,
        message: readyCond?.message || '',
      };
    });
    const expiringSoon = certificates.filter(
      (c) => c.daysUntilExpiry !== null && c.daysUntilExpiry < EXPIRY_WARNING_DAYS,
    ).length;
    const failed = certificates.filter((c) => !c.ready).length;
    return {
      metrics: { certificates, expiringSoon, failed },
      loaded,
      metricsAvailable: true,
    };
  }, [certs, loaded, policy]);
}
