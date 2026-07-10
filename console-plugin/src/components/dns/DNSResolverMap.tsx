import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { DnsResolver, STATUS_META } from './types';
import { DEFAULT_RESOLVERS } from './useDnsProber';

/**
 * Region-grouped view of the resolver ladder. The point of this
 * visualisation is one narrow, load-bearing question:
 *
 *   "Did the resolvers in different parts of the world land on the same
 *    cluster, or did they split?"
 *
 * A previous iteration tried to plot each resolver as a dot on a
 * hand-drawn world map — but hand-drawn continents at 800×360 read as
 * abstract blobs, and at the plugin's typical viewport width the dots
 * were pixel-sized and easy to miss. Ditched.
 *
 * The replacement is a horizontal band of geographic regions. Each
 * region is a card showing the resolvers that live there as dots
 * coloured by the answer they returned. Same answer, same colour, so
 * a working geo LB paints as literal per-region colour clusters:
 *
 *   Americas (5)     ● ● ● ● ●     3.130.81.46
 *   Europe (2)       ● ●           18.220.197.227
 *   Asia-Pacific (1) ●             3.130.81.46
 *
 * If the operator sees every region rendering the same colour, the
 * hostname is served from a single origin. If two regions split, geo
 * routing is doing something. If one region is empty, either the
 * resolver ladder didn't reach there or nothing responded — visible at
 * a glance.
 */

interface Props {
  resolvers: DnsResolver[];
  /** True when the DNSRecord shows more than one owner cluster
   *  publishing endpoints — the authoritative signal that multiple
   *  answers across resolvers imply multi-site geo routing (not just
   *  an ELB with multiple AZ IPs on a single cluster). Drives the
   *  contextual note below the region row. */
  isMultiSite: boolean;
}

/** Bucketing resolvers into coarse regions by longitude band. Bands are
 *  wide on purpose — this is about geographic pattern, not precise
 *  atlases. A resolver at lng=-77 (Reston, US) reads as Americas even
 *  though it's mid-Atlantic-adjacent.
 *
 *  The Middle East / Africa bucket is present but hidden when empty, to
 *  keep the row from being visually cluttered with a "0 resolvers" card
 *  on installs whose ladder is all-Americas + Europe. */
type RegionKey = 'americas' | 'europe' | 'middleEastAfrica' | 'asiaPacific';

interface RegionMeta {
  key: RegionKey;
  label: string;
  emoji: string;
  /** [lngMin, lngMax) — half-open. Wrap-around handled by asia's split. */
  lngRange: [number, number] | [number, number][];
}

const REGIONS: RegionMeta[] = [
  { key: 'americas', label: 'Americas', emoji: '🌎', lngRange: [-170, -30] },
  { key: 'europe', label: 'Europe', emoji: '🌍', lngRange: [-30, 40] },
  {
    key: 'middleEastAfrica',
    label: 'Middle East & Africa',
    emoji: '🌍',
    lngRange: [15, 60],
  },
  { key: 'asiaPacific', label: 'Asia-Pacific', emoji: '🌏', lngRange: [60, 190] },
];

function regionFor(lng: number): RegionKey {
  // Sequential membership — first match wins. MEA overlaps with Europe
  // on the eastern edge; anything east of 40 that isn't clearly Asia
  // (60+) falls into MEA.
  if (lng >= -170 && lng < -30) return 'americas';
  if (lng >= -30 && lng < 15) return 'europe';
  if (lng >= 15 && lng < 60) return 'middleEastAfrica';
  return 'asiaPacific';
}

/** Same palette as the earlier map — hand-picked to read on both light
 *  and dark themes. */
const IP_PALETTE = [
  '#3E8FE0', // blue
  '#F5A742', // orange
  '#5EBE7A', // green
  '#C160E0', // purple
  '#E86D6D', // red-pink
  '#4ECDC4', // teal
  '#F4C542', // yellow
];

function colorForTarget(target: string, uniqueSortedTargets: string[]): string {
  const idx = uniqueSortedTargets.indexOf(target);
  if (idx < 0) return 'var(--pf-t--global--color--nonstatus--gray--default)';
  return IP_PALETTE[idx % IP_PALETTE.length];
}

/** Extract the "answer" that identifies the cluster — for A records that
 *  is the IP after the "A " prefix, for CNAME the target hostname.
 *  NXDOMAIN / SERVFAIL etc. get kept as-is so unhealthy dots still
 *  cluster together. */
function normalisedTarget(r: DnsResolver): string {
  const s = r.result || '';
  const spaceIdx = s.indexOf(' ');
  if (spaceIdx > 0 && s.length > spaceIdx + 1) return s.slice(spaceIdx + 1).trim();
  return s;
}

interface PlottedResolver {
  r: DnsResolver;
  target: string;
  region: RegionKey;
}

const DNSResolverMap: React.FC<Props> = ({ resolvers, isMultiSite }) => {
  const plotted: PlottedResolver[] = resolvers
    .map((r) => {
      const meta = DEFAULT_RESOLVERS.find((d) => d.name === r.name);
      if (!meta) return null;
      return {
        r,
        target: normalisedTarget(r),
        region: regionFor(meta.lng),
      };
    })
    .filter((p): p is PlottedResolver => p !== null);

  // Colour assignment is stable across renders — sort the answers so
  // the same answer always maps to the same swatch, otherwise a slow
  // resolver could flip colours mid-poll.
  const uniqueTargets = [...new Set(plotted.map((p) => p.target))].sort();

  // Only show regions that actually have a resolver — an all-Americas
  // ladder shouldn't render three empty cards.
  const nonEmptyRegions = REGIONS.filter((reg) =>
    plotted.some((p) => p.region === reg.key),
  );

  // The colour split alone is NOT a reliable "multi-cluster" signal.
  // AWS ELBs publish 2-8 A records for multi-AZ redundancy and different
  // resolvers cache different subsets, so a hostname served from a
  // single cluster on AWS routinely returns 2+ IPs — one per AZ.
  //   * When the DNSRecord has more than one owner cluster (isMultiSite),
  //     multiple answers really do mean multiple sites → the row reads as
  //     "resolvers landing on different clusters", copy is celebratory.
  //   * When there is no co-owner but we still see multiple answers, it
  //     is (almost certainly) multi-AZ ELB round-robin on a single
  //     cluster → the row includes a plain-English note explaining the
  //     behaviour so an operator on a single-cluster install doesn't read
  //     the two colours as a fault.
  const multipleAnswers = uniqueTargets.length > 1;
  const showSingleClusterHint = multipleAnswers && !isMultiSite;

  return (
    <div className="rhcl-dns-map-wrap">
      <div className="rhcl-dns-region-row" role="list" aria-label="Resolvers grouped by region">
        {nonEmptyRegions.map((reg) => {
          const inRegion = plotted.filter((p) => p.region === reg.key);
          // Order dots within a region by target so identical answers
          // sit next to each other — reads as a coloured run rather
          // than scattered.
          inRegion.sort((a, b) => a.target.localeCompare(b.target));
          return (
            <div key={reg.key} className="rhcl-dns-region-card" role="listitem">
              <div className="rhcl-dns-region-head">
                <span className="rhcl-dns-region-emoji" aria-hidden="true">{reg.emoji}</span>
                <span className="rhcl-dns-region-label">{reg.label}</span>
                <span className="rhcl-dns-region-count">×{inRegion.length}</span>
              </div>
              <div className="rhcl-dns-region-dots">
                {inRegion.map((p) => {
                  const color = colorForTarget(p.target, uniqueTargets);
                  const statusColor = STATUS_META[p.r.status].color;
                  return (
                    <Tooltip
                      key={p.r.name}
                      content={
                        <div style={{ fontSize: 12 }}>
                          <strong>{p.r.name}</strong> · {p.r.location}
                          <br />
                          {p.r.result}
                          {p.r.latencyMs != null ? ` · ${p.r.latencyMs} ms` : ''}
                        </div>
                      }
                    >
                      <span
                        className="rhcl-dns-region-dot"
                        style={{
                          background: color,
                          borderColor: statusColor,
                        }}
                        aria-label={`${p.r.name} returned ${p.target}`}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend: one row per distinct answer with its swatch and count.
          Kept below the region row so the map reads first and the
          legend explains the colour code. */}
      <div className="rhcl-dns-map-legend">
        {uniqueTargets.map((t) => {
          const count = plotted.filter((p) => p.target === t).length;
          return (
            <span key={t} className="rhcl-dns-map-legend-item">
              <span
                className="rhcl-dns-map-legend-swatch"
                style={{ background: colorForTarget(t, uniqueTargets) }}
              />
              <span title={t}>{t || '—'}</span>
              <span className="rhcl-dns-map-legend-count">×{count}</span>
            </span>
          );
        })}
      </div>

      {/* Contextual explainer. Rendered only when the operator might
          otherwise misread the picture — see the isMultiSite discussion
          above the return. */}
      {showSingleClusterHint && (
        <div className="rhcl-dns-map-hint" role="note">
          <strong>Same cluster, different AZs.</strong> The
          {' '}{uniqueTargets.length}{' '}
          distinct IPs are frontend addresses of the same load balancer —
          AWS ELBs publish one A record per Availability Zone and
          resolvers cache different subsets. This is expected on
          single-cluster installs. See <em>DNS Provider &rarr; Co-owners</em>
          {' '}for the authoritative multi-cluster signal.
        </div>
      )}
      {isMultiSite && multipleAnswers && (
        <div className="rhcl-dns-map-hint rhcl-dns-map-hint--multisite" role="note">
          <strong>Multi-cluster routing active.</strong> The DNSRecord
          shows more than one cluster co-publishing this hostname.
          Different resolvers landing on different colours means geo /
          weighted routing is doing its job.
        </div>
      )}
    </div>
  );
};

export default DNSResolverMap;
