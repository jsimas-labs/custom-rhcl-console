import * as React from 'react';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';
import {
  GlobeIcon,
  ServerIcon,
  ClockIcon,
  CheckCircleIcon,
  NetworkIcon,
} from '@patternfly/react-icons';
import { Donut, DonutSlice } from '../tls/OverviewCharts';
import { DnsKpiCounts } from './useDnsOverview';

/**
 * Five KPI cards along the top of the DNS Overview. Mirrors the shape
 * of the TLS Overview KPIs — donut on the left card, big number +
 * microstats on the other four.
 *
 * Colours hardcoded — see the note in TLSOverviewKPICards for why the
 * PF status tokens render muted in the donut's SVG stroke context.
 */

const COLORS = {
  healthy: '#3E8635',
  propagating: '#F0AB00',
  failed: '#C9190B',
  unknown: '#8A8D90',
};

interface Props {
  kpi: DnsKpiCounts;
  /** Fired when the operator clicks a status pill in a KPI card — the
   *  page hooks this to the table's status filter. */
  onStatusClick?: (status: 'healthy' | 'propagating' | 'failed' | 'unknown' | null) => void;
}

const Row: React.FC<{
  label: string;
  value: number;
  color?: string;
  onClick?: () => void;
}> = ({ label, value, color, onClick }) => {
  const clickable = !!onClick;
  return (
    <div
      className={`rhcl-dns-overview-kpi-row${clickable ? ' rhcl-dns-overview-kpi-row--clickable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick!();
              }
            }
          : undefined
      }
    >
      <span className="rhcl-dns-overview-kpi-swatch" style={{ background: color }} />
      <span className="rhcl-dns-overview-kpi-row-label">{label}</span>
      <span className="rhcl-dns-overview-kpi-row-value">{value}</span>
    </div>
  );
};

const CardShell: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card className="rhcl-dns-overview-kpi" isCompact>
    <CardBody>
      <div className="rhcl-dns-overview-kpi-head">
        <span className="rhcl-dns-overview-kpi-icon">{icon}</span>
        <span className="rhcl-dns-overview-kpi-title">{title}</span>
      </div>
      {children}
    </CardBody>
  </Card>
);

const DNSOverviewKPICards: React.FC<Props> = ({ kpi, onStatusClick }) => {
  const { overall, propagation, publicResolution, providerSync } = kpi;
  const click = (s: 'healthy' | 'propagating' | 'failed' | 'unknown') =>
    onStatusClick ? () => onStatusClick(s) : undefined;

  const overallSegments: DonutSlice[] = [
    { label: 'Healthy', value: overall.healthy, color: COLORS.healthy },
    { label: 'Propagating', value: overall.propagating, color: COLORS.propagating },
    { label: 'Failed', value: overall.failed, color: COLORS.failed },
    { label: 'Unknown', value: overall.unknown, color: COLORS.unknown },
  ];
  const pct = (n: number) =>
    overall.total > 0 ? `${Math.round((n / overall.total) * 100)}%` : '0%';

  return (
    <Grid hasGutter>
      <GridItem lg={4} md={12}>
        <CardShell
          title="Overall DNS Health"
          icon={<GlobeIcon style={{ color: COLORS.healthy }} />}
        >
          <div className="rhcl-dns-overview-donut-row">
            <Donut
              segments={overallSegments}
              centerValue={overall.total}
              centerLabel="Total"
              size={130}
              strokeWidth={16}
            />
            <div className="rhcl-dns-overview-kpi-rows">
              <Row label={`Healthy · ${pct(overall.healthy)}`} value={overall.healthy} color={COLORS.healthy} onClick={click('healthy')} />
              <Row label={`Propagating · ${pct(overall.propagating)}`} value={overall.propagating} color={COLORS.propagating} onClick={click('propagating')} />
              <Row label={`Failed · ${pct(overall.failed)}`} value={overall.failed} color={COLORS.failed} onClick={click('failed')} />
              <Row label={`Unknown · ${pct(overall.unknown)}`} value={overall.unknown} color={COLORS.unknown} onClick={click('unknown')} />
            </div>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="DNS Records"
          icon={<ServerIcon style={{ color: 'var(--pf-t--global--color--brand--default)' }} />}
        >
          <div className="rhcl-dns-overview-kpi-big">{overall.total}</div>
          <div className="rhcl-dns-overview-kpi-caption">Total</div>
          <div className="rhcl-dns-overview-kpi-microstats">
            <span style={{ color: COLORS.healthy }}>{overall.healthy} Healthy</span>
            <span style={{ color: COLORS.propagating }}>{overall.propagating} Prop.</span>
            <span style={{ color: COLORS.failed }}>{overall.failed} Failed</span>
            <span style={{ color: COLORS.unknown }}>{overall.unknown} Unknown</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Propagation Status"
          icon={<ClockIcon style={{ color: COLORS.propagating }} />}
        >
          <div className="rhcl-dns-overview-kpi-big" style={{ color: COLORS.propagating }}>
            {propagation.inProgress}
          </div>
          <div className="rhcl-dns-overview-kpi-caption">In Progress</div>
          <div className="rhcl-dns-overview-kpi-microstats">
            <span style={{ color: COLORS.healthy }}>{propagation.under5min} &lt; 5 min</span>
            <span style={{ color: COLORS.propagating }}>{propagation.from5to15min} 5-15 min</span>
            <span style={{ color: COLORS.failed }}>{propagation.over15min} &gt; 15 min</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Public Resolution"
          icon={<CheckCircleIcon style={{ color: COLORS.healthy }} />}
        >
          <div className="rhcl-dns-overview-kpi-big" style={{ color: COLORS.healthy }}>
            {publicResolution.successRatePct}%
          </div>
          <div className="rhcl-dns-overview-kpi-caption">Success Rate</div>
          <div className="rhcl-dns-overview-kpi-microstats">
            <span style={{ color: COLORS.healthy }}>{publicResolution.resolved} Resolved</span>
            <span style={{ color: COLORS.failed }}>{publicResolution.failed} Failed</span>
            <span style={{ color: COLORS.unknown }}>{publicResolution.unknown} Unknown</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Provider Sync"
          icon={<NetworkIcon style={{ color: COLORS.healthy }} />}
        >
          <div className="rhcl-dns-overview-kpi-big">{providerSync.providers}</div>
          <div className="rhcl-dns-overview-kpi-caption">Providers</div>
          <div className="rhcl-dns-overview-kpi-microstats">
            <span style={{ color: COLORS.healthy }}>{providerSync.healthy} Healthy</span>
            <span style={{ color: COLORS.failed }}>{providerSync.issues} Issues</span>
            <span style={{ color: COLORS.unknown }}>{providerSync.unknown} Unknown</span>
          </div>
        </CardShell>
      </GridItem>
    </Grid>
  );
};

export default DNSOverviewKPICards;
