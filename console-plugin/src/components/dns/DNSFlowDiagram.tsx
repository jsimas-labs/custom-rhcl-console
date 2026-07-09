import * as React from 'react';
import { DnsStep, STATUS_META } from './types';
import DNSStepCard from './DNSStepCard';

/**
 * Renders the 7-step pipeline as a horizontal row of `DNSStepCard`s
 * separated by coloured chevron connectors. The connector's colour
 * blends the two adjacent card statuses via the "worst status wins"
 * rule from `useDnsTroubleshooting.worstStatus`, so a failing step
 * paints the arrows LEADING INTO it red — matches how operators read a
 * broken pipeline (the arrow indicts the destination, not the origin).
 *
 * On narrow viewports (< 900px) the grid wraps and the connectors
 * become vertical dividers; the CSS handles that.
 */

interface Props {
  steps: DnsStep[];
}

/**
 * When two adjacent cards have different statuses we paint the arrow
 * with the *worse* of the two. Priority reads high-to-low: failing >
 * pending/warning > not-configured > skipped > healthy. This makes the
 * pipeline "point at" a bad step without needing a legend.
 */
function connectorColor(a: DnsStep, b: DnsStep): string {
  const priority = ['failing', 'warning', 'pending', 'not-configured', 'skipped', 'healthy'];
  const worst = [a.status, b.status].sort((x, y) => priority.indexOf(x) - priority.indexOf(y))[0];
  return STATUS_META[worst].color;
}

const DNSFlowDiagram: React.FC<Props> = ({ steps }) => (
  <div className="rhcl-dns-flow" role="list">
    {steps.map((s, i) => (
      <React.Fragment key={s.id}>
        <div role="listitem" style={{ display: 'contents' }}>
          <DNSStepCard step={s} index={i} />
        </div>
        {i < steps.length - 1 && (
          <div
            className="rhcl-dns-flow-arrow"
            style={{ color: connectorColor(s, steps[i + 1]) }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default DNSFlowDiagram;
