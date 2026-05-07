import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CertificateGVK } from '../models';
import { Certificate, CertificateHealthLevel, Gateway } from '../types';

interface UseCertificatesResult {
  certificates: CertificateWithHealth[];
  loaded: boolean;
  error: Error | undefined;
}

export interface CertificateWithHealth {
  certificate: Certificate;
  healthLevel: CertificateHealthLevel;
  daysUntilExpiry: number | null;
  listenerName?: string;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function useCertificatesForGateway(
  gateway: Gateway | undefined,
  namespace: string,
): UseCertificatesResult {
  const [allCerts, loaded, error] = useK8sWatchResource<Certificate[]>({
    groupVersionKind: CertificateGVK,
    isList: true,
    namespace,
  });

  if (!gateway || !loaded) {
    return { certificates: [], loaded, error };
  }

  const tlsListeners = gateway.spec.listeners.filter((l) => l.tls?.certificateRefs?.length);
  const certNames = new Set<string>();
  const listenerByCertName = new Map<string, string>();

  for (const listener of tlsListeners) {
    for (const ref of listener.tls?.certificateRefs || []) {
      certNames.add(ref.name);
      listenerByCertName.set(ref.name, listener.name);
    }
  }

  const certificates: CertificateWithHealth[] = (allCerts || [])
    .filter((cert) => certNames.has(cert.metadata?.name || ''))
    .map((cert) => {
      const notAfter = cert.status?.notAfter;
      let daysUntilExpiry: number | null = null;
      let healthLevel: CertificateHealthLevel = 'ok';

      if (notAfter) {
        const expiryMs = new Date(notAfter).getTime() - Date.now();
        daysUntilExpiry = Math.floor(expiryMs / (24 * 60 * 60 * 1000));

        if (expiryMs < THREE_DAYS_MS) {
          healthLevel = 'critical';
        } else if (expiryMs < FOURTEEN_DAYS_MS) {
          healthLevel = 'warning';
        }
      }

      return {
        certificate: cert,
        healthLevel,
        daysUntilExpiry,
        listenerName: listenerByCertName.get(cert.metadata?.name || ''),
      };
    });

  return { certificates, loaded, error };
}
