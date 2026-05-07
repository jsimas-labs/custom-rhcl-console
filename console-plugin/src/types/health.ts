import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sCondition } from './common';

export interface Certificate extends K8sResourceCommon {
  spec: {
    secretName: string;
    issuerRef: {
      name: string;
      kind?: string;
      group?: string;
    };
    commonName?: string;
    dnsNames?: string[];
    duration?: string;
    renewBefore?: string;
  };
  status?: {
    conditions?: K8sCondition[];
    notBefore?: string;
    notAfter?: string;
    renewalTime?: string;
    revision?: number;
  };
}

export interface DNSRecordEndpoint {
  dnsName: string;
  recordType: string;
  targets: string[];
  recordTTL?: number;
  setIdentifier?: string;
  providerSpecific?: { name: string; value: string }[];
}

export interface DNSRecord extends K8sResourceCommon {
  spec: {
    rootHost?: string;
    providerRef?: { name: string };
    endpoints?: DNSRecordEndpoint[];
    managedZone?: { name: string };
  };
  status?: {
    conditions?: K8sCondition[];
    queuedAt?: string;
    queuedFor?: string;
    validFor?: string;
    domainOwners?: string[];
    zoneDomainName?: string;
    zoneID?: string;
  };
}

export type CertificateHealthLevel = 'ok' | 'warning' | 'critical';
