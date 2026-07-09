import * as React from 'react';
import {
  PageSection,
  Title,
  Button,
  Grid,
  GridItem,
  Spinner,
  Bullseye,
  Label,
} from '@patternfly/react-core';
import {
  SyncAltIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  MinusCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useDnsTroubleshooting } from './useDnsTroubleshooting';
import DNSFlowDiagram from './DNSFlowDiagram';
import DNSDiagnosisPanel from './DNSDiagnosisPanel';
import DNSTimeline from './DNSTimeline';
import DNSDiagnosticsTable from './DNSDiagnosticsTable';
import DNSResolverTable from './DNSResolverTable';
import { STATUS_META } from './types';
import '../../styles/plugin-glass.css';
import './dns-troubleshooting.css';

/**
 * Top-level page. The layout follows the mock:
 *
 *   1. Header — title, hostname picker, refresh, run-checks
 *   2. Overall status banner + legend
 *   3. Flow diagram (7 cards + connectors)
 *   4. Three-column mid section: Timeline | DNS checks | Diagnosis
 *   5. Bottom-wide: DNS resolvers table
 *
 * Everything reads from `useDnsTroubleshooting`, one big memoised
 * derivation of cluster + Prometheus-independent state. The refresh
 * button is a hard nudge (bumps a nonce) — the underlying watches
 * update live, so it's mostly there to make the operator feel in
 * control while they wait for propagation.
 */

const DNSTroubleshootingPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [selectedHostname, setSelectedHostname] = React.useState<string | null>(null);
  // A nonce we bump when the user clicks Refresh / Run diagnostics. The
  // useMemo in the hook already re-runs when its watches emit, so this
  // is largely cosmetic — but reading it in a key forces a synthesised
  // resolver table refresh so the "last checked" timestamps advance.
  const [tickKey, setTickKey] = React.useState(0);

  const flow = useDnsTroubleshooting(selectedHostname);

  if (flow.loading) {
    return (
      <div className="rhcl-plugin-root rhcl-dns-page">
        <PageSection variant="default">
          <Title headingLevel="h1">{t('DNS Troubleshooting')}</Title>
        </PageSection>
        <PageSection isFilled>
          <Bullseye>
            <Spinner size="xl" />
          </Bullseye>
        </PageSection>
      </div>
    );
  }

  const overallMeta = STATUS_META[flow.overallStatus];
  const banner = (() => {
    if (flow.overallStatus === 'healthy') {
      return {
        cls: 'is-healthy',
        icon: <CheckCircleIcon style={{ color: STATUS_META.healthy.color, fontSize: 20 }} />,
        title: t('DNS is healthy'),
        body: t('Hostname resolves and every step in the pipeline is green.'),
      };
    }
    if (flow.overallStatus === 'not-configured') {
      return {
        cls: '',
        icon: <MinusCircleIcon style={{ color: STATUS_META['not-configured'].color, fontSize: 20 }} />,
        title: t('Nothing to troubleshoot yet'),
        body: t('No hostname is exposed by any Gateway or HTTPRoute. Create one to begin.'),
      };
    }
    return {
      cls: 'is-failing',
      icon:
        flow.overallStatus === 'pending' ? (
          <ClockIcon style={{ color: STATUS_META.pending.color, fontSize: 20 }} />
        ) : (
          <ExclamationCircleIcon style={{ color: overallMeta.color, fontSize: 20 }} />
        ),
      title: t('DNS configuration requires attention'),
      body: flow.primaryFailure
        ? t('Blocked at "{{title}}" step. See Diagnosis for the likely cause and next steps.', {
            title: flow.primaryFailure.title,
          })
        : t('One or more pipeline steps are not healthy.'),
    };
  })();

  return (
    <div className="rhcl-plugin-root rhcl-dns-page" key={tickKey}>
      <PageSection variant="default">
        <div className="rhcl-dns-header">
          <div className="rhcl-dns-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title headingLevel="h1">{t('DNS Troubleshooting')}</Title>
              <Label color="blue" isCompact>BETA</Label>
            </div>
            <div style={{ fontSize: 14, color: 'var(--pf-v5-global--Color--200)' }}>
              {t('Visualize and debug DNS connectivity for your Kuadrant gateways.')}
            </div>
            <div className="rhcl-dns-hostname-picker">
              <label htmlFor="rhcl-dns-hostname" style={{ fontSize: 12, fontWeight: 600 }}>
                {t('Hostname')}
              </label>
              <select
                id="rhcl-dns-hostname"
                value={flow.hostname}
                onChange={(e) => setSelectedHostname(e.target.value)}
                disabled={flow.hostnameOptions.length === 0}
              >
                {flow.hostnameOptions.length === 0 ? (
                  <option>—</option>
                ) : (
                  flow.hostnameOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))
                )}
              </select>
              <span
                style={{
                  display: 'inline-flex',
                  gap: 4,
                  alignItems: 'center',
                  fontSize: 12,
                  color: overallMeta.color,
                }}
              >
                {overallMeta.label}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button
              variant="secondary"
              icon={<SyncAltIcon />}
              onClick={() => setTickKey((k) => k + 1)}
            >
              {t('Refresh')}
            </Button>
            <Button
              variant="primary"
              icon={<PlayIcon />}
              onClick={() => setTickKey((k) => k + 1)}
            >
              {t('Run all checks')}
            </Button>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className={`rhcl-dns-status-banner ${banner.cls}`}>
          {banner.icon}
          <div>
            <div style={{ fontWeight: 600 }}>{banner.title}</div>
            <div style={{ fontSize: 13, color: 'var(--pf-v5-global--Color--200)', marginTop: 2 }}>
              {banner.body}
            </div>
          </div>
        </div>

        <DNSFlowDiagram steps={flow.steps} />

        <div className="rhcl-dns-legend" aria-label={t('Status legend')}>
          <span><CheckCircleIcon style={{ color: STATUS_META.healthy.color }} /> {STATUS_META.healthy.label}</span>
          <span><ClockIcon style={{ color: STATUS_META.pending.color }} /> {STATUS_META.pending.label}</span>
          <span><ExclamationTriangleIcon style={{ color: STATUS_META.warning.color }} /> {STATUS_META.warning.label}</span>
          <span><ExclamationCircleIcon style={{ color: STATUS_META.failing.color }} /> {STATUS_META.failing.label}</span>
          <span><MinusCircleIcon style={{ color: STATUS_META.skipped.color }} /> {STATUS_META.skipped.label}</span>
          <span><MinusCircleIcon style={{ color: STATUS_META['not-configured'].color }} /> {STATUS_META['not-configured'].label}</span>
        </div>
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          <GridItem lg={4} md={12}>
            <DNSTimeline events={flow.events} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <DNSDiagnosticsTable checks={flow.checks} />
          </GridItem>
          <GridItem lg={4} md={12}>
            <DNSDiagnosisPanel flow={flow} />
          </GridItem>
        </Grid>
      </PageSection>

      <PageSection>
        <DNSResolverTable resolvers={flow.resolvers} />
      </PageSection>
    </div>
  );
};

export default DNSTroubleshootingPage;
