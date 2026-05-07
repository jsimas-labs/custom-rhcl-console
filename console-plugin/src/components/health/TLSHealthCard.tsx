import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useCertificatesForGateway, CertificateWithHealth } from '../../hooks/useCertificatesForGateway';
import { Gateway, CertificateHealthLevel } from '../../types';

interface TLSHealthCardProps {
  gateway: Gateway;
  namespace: string;
}

const HEALTH_COLORS: Record<CertificateHealthLevel, 'green' | 'orange' | 'red'> = {
  ok: 'green',
  warning: 'orange',
  critical: 'red',
};

const HEALTH_ICONS: Record<CertificateHealthLevel, React.ReactNode> = {
  ok: <CheckCircleIcon />,
  warning: <ExclamationTriangleIcon />,
  critical: <ExclamationCircleIcon />,
};

const TLSHealthCard: React.FC<TLSHealthCardProps> = ({ gateway, namespace }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { certificates, loaded, error } = useCertificatesForGateway(gateway, namespace);

  if (!loaded) {
    return (
      <Card>
        <CardTitle>{t('TLS health')}</CardTitle>
        <CardBody><Spinner size="lg" /></CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle>{t('TLS health')}</CardTitle>
        <CardBody>
          <EmptyState variant="sm" titleText={t('Error loading certificates')} headingLevel="h3">
            <EmptyStateBody>{error.message}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardTitle>{t('TLS health')}</CardTitle>
        <CardBody>
          <EmptyState variant="sm" titleText={t('No TLS certificates')} headingLevel="h3">
            <EmptyStateBody>
              {t('No TLS listeners or certificates found for this Gateway.')}
            </EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{t('TLS health')}</CardTitle>
      <CardBody>
        <Table aria-label={t('TLS health')} variant="compact">
          <Thead>
            <Tr>
              <Th>Listener</Th>
              <Th>{t('Certificate')}</Th>
              <Th>{t('Issuer')}</Th>
              <Th>{t('Expires')}</Th>
              <Th>{t('Renewal status')}</Th>
              <Th>{t('Status')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {certificates.map((entry) => (
              <CertificateRow key={entry.certificate.metadata?.uid} entry={entry} />
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

const CertificateRow: React.FC<{ entry: CertificateWithHealth }> = ({ entry }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const cert = entry.certificate;
  let healthText = t('Healthy');
  if (entry.healthLevel === 'warning') {
    healthText = t('Warning: certificate expires in less than 14 days');
  } else if (entry.healthLevel === 'critical') {
    healthText = t('Critical: certificate expires in less than 3 days');
  }

  return (
    <Tr>
      <Td>{entry.listenerName || '-'}</Td>
      <Td>{cert.metadata?.name || '-'}</Td>
      <Td>
        {cert.spec.issuerRef.name}
        {cert.spec.issuerRef.kind ? ` (${cert.spec.issuerRef.kind})` : ''}
      </Td>
      <Td>{cert.status?.notAfter || '-'}</Td>
      <Td>{cert.status?.renewalTime || '-'}</Td>
      <Td>
        <Label
          color={HEALTH_COLORS[entry.healthLevel]}
          icon={HEALTH_ICONS[entry.healthLevel]}
        >
          {healthText}
        </Label>
      </Td>
    </Tr>
  );
};

export default TLSHealthCard;
