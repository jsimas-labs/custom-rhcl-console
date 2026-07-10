import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { STATUS_META } from '../dns/types';
import { Donut, Histogram } from './OverviewCharts';
import {
  ExpirationBucket,
  IssuerSlice,
  TlsOverviewEvent,
} from './useTlsOverview';

/**
 * Three cards along the bottom row of the TLS Overview page:
 *
 *   1. Expiration Distribution — histogram of the six days-remaining
 *      buckets. Bucket colours match the KPI card semantics: red on
 *      expired / <7d, orange on 7-30d, green on 30+.
 *   2. Top Certificate Issuers — donut of `issuerLabel` counts with a
 *      legend + count. Reads at a glance which CA the cluster relies on.
 *   3. Recent TLS Events — vertical timeline of the last 15 renewal /
 *      failure / issued events. Each row deep-links into the
 *      troubleshooting page for that hostname when we have the
 *      correlation.
 */

/** Palette shared with the issuer donut. Rotates through 7 hand-picked
 *  colours (same set used by the DNS resolver map) so light+dark themes
 *  both look right. */
const ISSUER_PALETTE = [
  '#3E8FE0',
  '#F5A742',
  '#5EBE7A',
  '#C160E0',
  '#E86D6D',
  '#4ECDC4',
  '#F4C542',
];

// -------------------- Expiration --------------------

interface ExpirationProps {
  buckets: ExpirationBucket[];
}

// Hex hardcoded — see the note in TLSOverviewKPICards for why the PF
// status tokens don't render right in the SVG chart contexts.
const severityColor = (s: ExpirationBucket['severity']): string => {
  switch (s) {
    case 'critical':
      return '#C9190B';
    case 'warning':
      return '#F0AB00';
    case 'healthy':
      return '#3E8635';
  }
};

export const TLSOverviewExpiration: React.FC<ExpirationProps> = ({ buckets }) => {
  const total = buckets.reduce((acc, b) => acc + b.count, 0);
  return (
    <Card aria-label="Expiration distribution" className="rhcl-tls-overview-panel">
      <CardTitle>Expiration Distribution</CardTitle>
      <CardBody>
        {total === 0 ? (
          <EmptyState titleText="No certificates on the cluster" headingLevel="h4">
            <EmptyStateBody>Nothing to place on the timeline yet.</EmptyStateBody>
          </EmptyState>
        ) : (
          <>
            <Histogram
              bars={buckets.map((b) => ({
                label: b.label,
                value: b.count,
                color: severityColor(b.severity),
              }))}
              height={180}
            />
            <div className="rhcl-tls-overview-histo-caption">
              Total: {total} certificate{total === 1 ? '' : 's'}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

// -------------------- Top Issuers --------------------

interface IssuersProps {
  slices: IssuerSlice[];
  onIssuerClick?: (issuer: string) => void;
}

export const TLSOverviewIssuers: React.FC<IssuersProps> = ({ slices, onIssuerClick }) => {
  const total = slices.reduce((acc, s) => acc + s.count, 0);
  const segments = slices.map((s, i) => ({
    label: s.label,
    value: s.count,
    color: ISSUER_PALETTE[i % ISSUER_PALETTE.length],
  }));
  return (
    <Card aria-label="Top certificate issuers" className="rhcl-tls-overview-panel">
      <CardTitle>Top Issuers</CardTitle>
      <CardBody>
        {total === 0 ? (
          <EmptyState titleText="No issuers to summarise" headingLevel="h4">
            <EmptyStateBody>
              Populated once a Certificate exists that references an Issuer
              / ClusterIssuer.
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <div className="rhcl-tls-overview-issuer-row">
            <Donut
              segments={segments.map((s) => ({
                label: s.label,
                value: s.value,
                color: s.color,
              }))}
              centerValue={total}
              centerLabel="Total"
              size={150}
              strokeWidth={20}
            />
            <ul className="rhcl-tls-overview-issuer-legend">
              {segments.map((s) => {
                const clickable = !!onIssuerClick;
                return (
                  <li
                    key={s.label}
                    className={clickable ? 'rhcl-tls-overview-issuer-item--clickable' : undefined}
                    onClick={clickable ? () => onIssuerClick!(s.label) : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onIssuerClick!(s.label);
                            }
                          }
                        : undefined
                    }
                  >
                    <span
                      className="rhcl-tls-overview-swatch"
                      style={{ background: s.color }}
                    />
                    <span className="rhcl-tls-overview-issuer-label">{s.label}</span>
                    <span className="rhcl-tls-overview-issuer-count">
                      {s.value}
                      <span className="rhcl-tls-overview-issuer-pct">
                        {' '}
                        · {Math.round((s.value / total) * 100)}%
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// -------------------- Recent Events --------------------

interface EventsProps {
  events: TlsOverviewEvent[];
}

const iconFor = (kind: TlsOverviewEvent['kind']) => {
  switch (kind) {
    case 'renewed':
    case 'issued':
      return <CheckCircleIcon style={{ color: STATUS_META.healthy.color }} />;
    case 'expired':
      return <ExclamationCircleIcon style={{ color: STATUS_META.failing.color }} />;
    case 'renewal-failed':
    case 'handshake-failed':
      return <ExclamationTriangleIcon style={{ color: STATUS_META.warning.color }} />;
    default:
      return <InfoCircleIcon style={{ color: STATUS_META.unknown.color }} />;
  }
};

function relativeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return 'just now';
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const TLSOverviewRecentEvents: React.FC<EventsProps> = ({ events }) => (
  <Card aria-label="Recent TLS events" className="rhcl-tls-overview-panel">
    <CardTitle>Recent TLS Events</CardTitle>
    <CardBody>
      {events.length === 0 ? (
        <EmptyState titleText="No recent events" headingLevel="h4">
          <EmptyStateBody>
            Certificate and Challenge activity will surface here.
          </EmptyStateBody>
        </EmptyState>
      ) : (
        <ul className="rhcl-tls-overview-events">
          {events.map((e) => (
            <li key={e.id}>
              <span className="rhcl-tls-overview-events-icon">{iconFor(e.kind)}</span>
              <span className="rhcl-tls-overview-events-body">
                <div className="rhcl-tls-overview-events-title">
                  {e.href ? (
                    <Link to={e.href}>{e.title}</Link>
                  ) : (
                    e.title
                  )}
                </div>
                {e.detail && (
                  <div className="rhcl-tls-overview-events-detail">{e.detail}</div>
                )}
              </span>
              <span className="rhcl-tls-overview-events-when">{relativeAgo(e.when)}</span>
            </li>
          ))}
        </ul>
      )}
    </CardBody>
  </Card>
);
