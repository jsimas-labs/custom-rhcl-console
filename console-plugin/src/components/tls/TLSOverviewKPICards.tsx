import * as React from 'react';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';
import {
  LockIcon,
  RedoIcon,
  ClockIcon,
  ShieldAltIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';
import { Donut, DonutSlice } from './OverviewCharts';
import { KpiCounts } from './useTlsOverview';

/**
 * Five KPI cards along the top of the TLS Overview page. Same
 * "8-10px radius, subtle border, flat body" language as the Overview
 * cards elsewhere in the plugin; a donut sits inside the first card
 * for the health breakdown so the eye lands on where the mass of the
 * problem is at a glance.
 *
 * Colours are hardcoded hex — the PatternFly status tokens
 * (`var(--pf-t--global--color--status--…--default)`) render muted in
 * an SVG `stroke` context on the plugin's PF5 baseline, turning the
 * donut into a washed-out ring. The RH design-system green/orange/red
 * below match what the DNS Overview mockup shows.
 */

const COLORS = {
  healthy: '#3E8635',
  expiring: '#F0AB00',
  expired: '#C9190B',
  error: '#8A8D90',
  scheduled: '#3E8635',
  notScheduled: '#F0AB00',
  failed: '#C9190B',
  ok: '#3E8635',
  unknown: '#8A8D90',
};

interface Props {
  kpi: KpiCounts;
  onStatusClick?: (status: 'healthy' | 'expiring' | 'expired' | 'error' | null) => void;
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
      className={`rhcl-tls-overview-kpi-row${clickable ? ' rhcl-tls-overview-kpi-row--clickable' : ''}`}
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
      <span className="rhcl-tls-overview-kpi-swatch" style={{ background: color }} />
      <span className="rhcl-tls-overview-kpi-row-label">{label}</span>
      <span className="rhcl-tls-overview-kpi-row-value">{value}</span>
    </div>
  );
};

const CardShell: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card className="rhcl-tls-overview-kpi" isCompact>
    <CardBody>
      <div className="rhcl-tls-overview-kpi-head">
        <span className="rhcl-tls-overview-kpi-icon">{icon}</span>
        <span className="rhcl-tls-overview-kpi-title">{title}</span>
      </div>
      {children}
    </CardBody>
  </Card>
);

const TLSOverviewKPICards: React.FC<Props> = ({ kpi, onStatusClick }) => {
  const { overall, renewal, expiringSoon, handshake } = kpi;
  const click = (s: 'healthy' | 'expiring' | 'expired' | 'error') =>
    onStatusClick ? () => onStatusClick(s) : undefined;

  const overallSegments: DonutSlice[] = [
    { label: 'Healthy', value: overall.healthy, color: COLORS.healthy },
    { label: 'Expiring Soon', value: overall.expiring, color: COLORS.expiring },
    { label: 'Expired', value: overall.expired, color: COLORS.expired },
    { label: 'Error', value: overall.error, color: COLORS.error },
  ];

  const pct = (n: number) =>
    overall.total > 0 ? `${Math.round((n / overall.total) * 100)}%` : '0%';

  return (
    <Grid hasGutter>
      <GridItem lg={4} md={12}>
        <CardShell
          title="Overall TLS Health"
          icon={<ShieldAltIcon style={{ color: COLORS.healthy }} />}
        >
          <div className="rhcl-tls-overview-donut-row">
            <Donut
              segments={overallSegments}
              centerValue={overall.total}
              centerLabel="Total"
              size={130}
              strokeWidth={16}
            />
            <div className="rhcl-tls-overview-kpi-rows">
              <Row label={`Healthy · ${pct(overall.healthy)}`} value={overall.healthy} color={COLORS.healthy} onClick={click('healthy')} />
              <Row label={`Expiring · ${pct(overall.expiring)}`} value={overall.expiring} color={COLORS.expiring} onClick={click('expiring')} />
              <Row label={`Expired · ${pct(overall.expired)}`} value={overall.expired} color={COLORS.expired} onClick={click('expired')} />
              <Row label={`Error · ${pct(overall.error)}`} value={overall.error} color={COLORS.error} onClick={click('error')} />
            </div>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Certificates"
          icon={<LockIcon style={{ color: 'var(--pf-t--global--color--brand--default)' }} />}
        >
          <div className="rhcl-tls-overview-kpi-big">{overall.total}</div>
          <div className="rhcl-tls-overview-kpi-caption">Total</div>
          <div className="rhcl-tls-overview-kpi-microstats">
            <span style={{ color: COLORS.healthy }}>{overall.healthy} Valid</span>
            <span style={{ color: COLORS.expiring }}>{overall.expiring} Exp. Soon</span>
            <span style={{ color: COLORS.expired }}>{overall.expired} Expired</span>
            <span style={{ color: COLORS.error }}>{overall.error} Error</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Auto Renewal"
          icon={<RedoIcon style={{ color: COLORS.scheduled }} />}
        >
          <div className="rhcl-tls-overview-kpi-big" style={{ color: COLORS.scheduled }}>
            {renewal.scheduled}
          </div>
          <div className="rhcl-tls-overview-kpi-caption">Scheduled</div>
          <div className="rhcl-tls-overview-kpi-microstats">
            <span style={{ color: COLORS.scheduled }}>{renewal.scheduled} Scheduled</span>
            <span style={{ color: COLORS.notScheduled }}>{renewal.notScheduled} Not Sched.</span>
            <span style={{ color: COLORS.failed }}>{renewal.failed} Failed</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="Expiring Soon"
          icon={<ClockIcon style={{ color: COLORS.expiring }} />}
        >
          <div className="rhcl-tls-overview-kpi-big" style={{ color: COLORS.expiring }}>
            {expiringSoon.total}
          </div>
          <div className="rhcl-tls-overview-kpi-caption">Within 30 days</div>
          <div className="rhcl-tls-overview-kpi-microstats">
            <span style={{ color: COLORS.expired }}>{expiringSoon.within7} within 7d</span>
            <span style={{ color: COLORS.expiring }}>{expiringSoon.within30} 7-30d</span>
          </div>
        </CardShell>
      </GridItem>

      <GridItem lg={2} md={6}>
        <CardShell
          title="TLS Handshake"
          icon={<CheckCircleIcon style={{ color: COLORS.ok }} />}
        >
          <div className="rhcl-tls-overview-kpi-big" style={{ color: COLORS.ok }}>
            {handshake.ok}
          </div>
          <div className="rhcl-tls-overview-kpi-caption">Predicted OK</div>
          <div className="rhcl-tls-overview-kpi-microstats">
            <span style={{ color: COLORS.ok }}>{handshake.ok} OK</span>
            <span style={{ color: COLORS.failed }}>{handshake.failed} Failed</span>
            <span style={{ color: COLORS.unknown }}>{handshake.unknown} Unknown</span>
          </div>
        </CardShell>
      </GridItem>
    </Grid>
  );
};

export default TLSOverviewKPICards;
