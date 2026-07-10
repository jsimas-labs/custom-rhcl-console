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
import { SyncAltIcon, ExternalLinkAltIcon, GlobeIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { useDnsOverview } from './useDnsOverview';
import { useDnsOverviewFilters } from './useDnsOverviewFilters';
import DNSOverviewCallout from './DNSOverviewCallout';
import DNSOverviewKPICards from './DNSOverviewKPICards';
import DNSOverviewTable from './DNSOverviewTable';
import {
  DNSOverviewPropagation,
  DNSOverviewProviders,
  DNSOverviewResolverResolution,
  DNSOverviewRecentEvents,
} from './DNSOverviewBottomWidgets';
import './dns-overview.css';

/**
 * DNS operational control tower. Filter state lives at the page level
 * so:
 *
 *   - KPI card legend rows filter the table by status
 *   - Top Providers donut slices filter by provider
 *   - the Needs Attention callout's "Review failed records" jumps
 *     straight to status=failed
 *   - the URL query string (?search=…&status=…&provider=…) carries
 *     the current scope for bookmarking and back-button behaviour
 *
 * The DNS Records table is the primary drill-down surface: click a
 * hostname to open DNS Troubleshooting for that record.
 */

const DNSOverviewPage: React.FC = () => {
  const [tick, setTick] = React.useState(0);
  void tick;
  const overview = useDnsOverview();
  const { filters, applyOne, clearAll } = useDnsOverviewFilters();

  const refresh = React.useCallback(() => setTick((k) => k + 1), []);

  if (overview.loading) {
    return (
      <div className="rhcl-plugin-root rhcl-dns-overview-page">
        <PageSection>
          <Bullseye>
            <Spinner size="lg" />
          </Bullseye>
        </PageSection>
      </div>
    );
  }

  // Sample hostname for the resolver widget. Prefer the currently
  // filtered scope's first row so a scoped view probes something
  // relevant.
  const sampleHostname =
    overview.rows.find((r) => r.status === 'healthy')?.hostname ||
    overview.rows[0]?.hostname ||
    null;

  return (
    <div className="rhcl-plugin-root rhcl-dns-overview-page">
      <PageSection variant="default">
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">
              <GlobeIcon style={{ marginRight: 8 }} />
              DNS Overview
            </Title>
            <div className="rhcl-dns-overview-subtitle">
              Monitor the health and propagation status of DNS records across your gateways.
            </div>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <span className="rhcl-dns-overview-lastupdated">Last updated: just now</span>
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
                    <Link {...props} to="/connectivity-link/dns/troubleshooting" />
                  )}
                >
                  Go to DNS Troubleshooting
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection>
        <DNSOverviewKPICards
          kpi={overview.kpi}
          onStatusClick={(s) => applyOne('status', s)}
        />
      </PageSection>

      <PageSection>
        <DNSOverviewCallout
          kpi={overview.kpi}
          onReviewFailed={() => applyOne('status', 'failed')}
        />
      </PageSection>

      <PageSection>
        <DNSOverviewTable
          rows={overview.rows}
          filterOptions={overview.filters}
          filters={filters}
          onFilterChange={applyOne}
          onClearAll={clearAll}
        />
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          <GridItem lg={3} md={12}>
            <DNSOverviewPropagation buckets={overview.propagationBuckets} />
          </GridItem>
          <GridItem lg={3} md={12}>
            <DNSOverviewProviders
              slices={overview.providerSlices}
              onProviderClick={(p) => applyOne('provider', p)}
            />
          </GridItem>
          <GridItem lg={3} md={12}>
            <DNSOverviewResolverResolution sampleHostname={sampleHostname} />
          </GridItem>
          <GridItem lg={3} md={12}>
            <DNSOverviewRecentEvents events={overview.recentEvents} />
          </GridItem>
        </Grid>
      </PageSection>
    </div>
  );
};

export default DNSOverviewPage;
