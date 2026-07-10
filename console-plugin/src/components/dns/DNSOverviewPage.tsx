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
 * DNS operational control tower. Same 3-tier structure as the TLS
 * Overview: KPI cards → filterable records table → 4 bottom widgets.
 *
 * The DNS Records table is the primary navigation surface: click a
 * hostname to drill into DNS Troubleshooting for that record.
 */

const DNSOverviewPage: React.FC = () => {
  const [tick, setTick] = React.useState(0);
  void tick;
  const overview = useDnsOverview();

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

  // Pick a representative hostname for the resolver widget — first row
  // (which is worst-status-first after sort). Falls back to the healthy
  // one if the failing rows lack a hostname (should never happen).
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
        <DNSOverviewKPICards kpi={overview.kpi} />
      </PageSection>

      <PageSection>
        <DNSOverviewTable rows={overview.rows} filterOptions={overview.filters} />
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          <GridItem lg={3} md={12}>
            <DNSOverviewPropagation buckets={overview.propagationBuckets} />
          </GridItem>
          <GridItem lg={3} md={12}>
            <DNSOverviewProviders slices={overview.providerSlices} />
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
