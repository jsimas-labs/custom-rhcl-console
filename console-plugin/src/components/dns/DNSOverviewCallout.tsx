import * as React from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { DnsKpiCounts } from './useDnsOverview';

interface Props {
  kpi: DnsKpiCounts;
  onReviewFailed: () => void;
}

/**
 * Compact status banner that sits above the DNS Records table. Renders
 * one of three states:
 *
 *   - failed records or old propagations → warning callout with
 *     "Review failed records" action that filters the table to
 *     status=failed
 *   - only propagating records (no failures) → info callout
 *   - all healthy → success callout ("all clear")
 *
 * We don't render anything at all while the aggregate is empty (no
 * records yet) — the table's own empty state carries the "no records"
 * copy.
 */
const DNSOverviewCallout: React.FC<Props> = ({ kpi, onReviewFailed }) => {
  const { overall, propagation } = kpi;
  if (overall.total === 0) return null;

  const failed = overall.failed;
  const stalePropagation = propagation.over15min;

  if (failed > 0 || stalePropagation > 0) {
    const pieces: string[] = [];
    if (failed > 0) {
      pieces.push(`${failed} record${failed === 1 ? '' : 's'} failing`);
    }
    if (stalePropagation > 0) {
      pieces.push(
        `${stalePropagation} record${stalePropagation === 1 ? '' : 's'} propagating for more than 15 minutes`,
      );
    }
    return (
      <Alert
        variant="warning"
        title="DNS requires attention"
        actionLinks={
          <>
            <AlertActionLink onClick={onReviewFailed}>Review failed records</AlertActionLink>
            <AlertActionLink
              component={(props) => (
                <Link {...props} to="/connectivity-link/dns/troubleshooting" />
              )}
            >
              Open DNS Troubleshooting
            </AlertActionLink>
          </>
        }
        isInline
      >
        {pieces.join(' and ')}.
      </Alert>
    );
  }

  if (overall.propagating > 0) {
    return (
      <Alert
        variant="info"
        title="DNS records propagating"
        isInline
      >
        {overall.propagating} record{overall.propagating === 1 ? '' : 's'} still propagating —
        this is expected shortly after creation or a record change.
      </Alert>
    );
  }

  return (
    <Alert
      variant="success"
      title="All DNS records are healthy"
      isInline
    >
      All configured hostnames resolve correctly across the checked resolvers.
    </Alert>
  );
};

export default DNSOverviewCallout;
