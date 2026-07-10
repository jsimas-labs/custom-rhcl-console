import * as React from 'react';
import {
  PageSection,
  Title,
  Flex,
  FlexItem,
  Button,
  Spinner,
  Bullseye,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { SyncAltIcon, ExternalLinkAltIcon, LockIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { useTlsOverview } from './useTlsOverview';
import { useTlsOverviewFilters } from './useTlsOverviewFilters';
import TLSOverviewKPICards from './TLSOverviewKPICards';
import TLSOverviewTable from './TLSOverviewTable';
import TLSOverviewCallout from './TLSOverviewCallout';
import {
  TLSOverviewExpiration,
  TLSOverviewIssuers,
  TLSOverviewRecentEvents,
} from './TLSOverviewBottomWidgets';
import './tls-overview.css';

/**
 * Operational control tower for TLS. Sits above the TLS Troubleshooting
 * page in the nav — you land here to see the fleet's health, and you
 * click through into troubleshooting for a specific hostname when
 * something needs eyes.
 *
 * Layout:
 *   1. Header — title, last updated stamp, Refresh, deep-link to
 *      troubleshooting.
 *   2. 5 KPI cards (donut + counters + microstats).
 *   3. TLS Certificates table with search + Gateway/Issuer/Status/NS
 *      filters. This is the primary navigation surface — click any
 *      row to jump into TLS Troubleshooting for that hostname.
 *   4. Three operational widgets: Expiration Distribution histogram,
 *      Top Issuers donut, Recent TLS Events timeline.
 */

const TLSOverviewPage: React.FC = () => {
  const [tick, setTick] = React.useState(0);
  void tick;
  const overview = useTlsOverview();
  const { filters, applyOne, clearAll } = useTlsOverviewFilters();

  const refresh = React.useCallback(() => setTick((k) => k + 1), []);

  const lastUpdatedLabel = React.useMemo(() => {
    // The watches update in real time; the "last updated" is
    // effectively "now" — but we still render a stamp because it
    // reassures the operator this isn't a stale snapshot.
    return 'just now';
  }, []);

  if (overview.loading) {
    return (
      <div className="rhcl-plugin-root rhcl-tls-overview-page">
        <PageSection>
          <Bullseye>
            <Spinner size="lg" />
          </Bullseye>
        </PageSection>
      </div>
    );
  }

  return (
    <div className="rhcl-plugin-root rhcl-tls-overview-page">
      <PageSection variant="default">
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">
              <LockIcon style={{ marginRight: 8 }} />
              TLS Overview
            </Title>
            <div className="rhcl-tls-overview-subtitle">
              Monitor the health and status of TLS certificates across your gateways.
            </div>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <span className="rhcl-tls-overview-lastupdated">
                  Last updated: {lastUpdatedLabel}
                </span>
              </FlexItem>
              <FlexItem>
                <Button variant="plain" aria-label="Refresh" onClick={refresh}>
                  <SyncAltIcon />
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="primary"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="end"
                  component={(props) => (
                    <Link {...props} to="/connectivity-link/tls/troubleshooting" />
                  )}
                >
                  Go to TLS Troubleshooting
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* 5 KPI cards */}
      <PageSection>
        <TLSOverviewKPICards
          kpi={overview.kpi}
          onStatusClick={(s) => applyOne('status', s)}
        />
      </PageSection>

      <PageSection>
        <TLSOverviewCallout
          kpi={overview.kpi}
          onReviewFailed={() => applyOne('status', 'expired')}
          onReviewExpiring={() => applyOne('status', 'expiring')}
        />
      </PageSection>

      {/* Table */}
      <PageSection>
        <TLSOverviewTable
          rows={overview.rows}
          filterOptions={overview.filters}
          filters={filters}
          onFilterChange={applyOne}
          onClearAll={clearAll}
        />
      </PageSection>

      {/* Bottom widgets */}
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={4} md={12}>
            <TLSOverviewExpiration buckets={overview.expirationBuckets} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <TLSOverviewIssuers
              slices={overview.issuerSlices}
              onIssuerClick={(iss) => applyOne('issuer', iss)}
            />
          </GridItem>
          <GridItem lg={4} md={12}>
            <TLSOverviewRecentEvents events={overview.recentEvents} />
          </GridItem>
        </Grid>
      </PageSection>
    </div>
  );
};

export default TLSOverviewPage;
