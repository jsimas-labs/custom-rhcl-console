import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { KpiCounts } from './useTlsOverview';

interface Props {
  kpi: KpiCounts;
  onReviewFailed: () => void;
  onReviewExpiring: () => void;
}

/**
 * Compact status banner above the TLS Certificates table.
 *
 *   - expired / error certs → warning: "TLS requires attention"
 *   - expiring soon only    → info: "certificates expiring soon"
 *   - all healthy           → success: "all certificates are healthy"
 */
const TLSOverviewCallout: React.FC<Props> = ({
  kpi,
  onReviewFailed,
  onReviewExpiring,
}) => {
  const { overall, expiringSoon } = kpi;
  if (overall.total === 0) return null;

  const critical = overall.expired + overall.error;
  if (critical > 0) {
    const pieces: string[] = [];
    if (overall.expired > 0) pieces.push(`${overall.expired} expired`);
    if (overall.error > 0) pieces.push(`${overall.error} in error`);
    if (expiringSoon.within7 > 0) pieces.push(`${expiringSoon.within7} expiring within 7 days`);
    return (
      <Alert
        variant="warning"
        title="TLS requires attention"
        actionLinks={
          <>
            <AlertActionLink onClick={onReviewFailed}>Review expired certificates</AlertActionLink>
            <AlertActionLink
              component={(props) => (
                <Link {...props} to="/connectivity-link/tls/troubleshooting" />
              )}
            >
              Open TLS Troubleshooting
            </AlertActionLink>
          </>
        }
        isInline
      >
        {pieces.join(', ')}.
      </Alert>
    );
  }

  if (overall.expiring > 0) {
    return (
      <Alert
        variant="info"
        title={`${overall.expiring} certificate${overall.expiring === 1 ? '' : 's'} expiring soon`}
        actionLinks={
          <AlertActionLink onClick={onReviewExpiring}>Review expiring certificates</AlertActionLink>
        }
        isInline
      >
        Renewals should be underway — check the Auto Renewal column.
      </Alert>
    );
  }

  return (
    <Alert
      variant="success"
      title="All TLS certificates are healthy"
      isInline
    >
      Every managed certificate is valid, has an auto-renewal scheduled, and would present a
      trusted chain to a client right now.
    </Alert>
  );
};

export default TLSOverviewCallout;
