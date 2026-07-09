import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Tooltip,
  Label,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Alert,
  Spinner,
  Button,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  OutlinedQuestionCircleIcon,
  GlobeIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import { DnsResolver, STATUS_META } from './types';
import { UseDnsProberResult } from './useDnsProber';

/**
 * Cross-resolver table. Three visual states, mutually exclusive:
 *
 *   1. **Prober configured + reachable** — renders the real per-resolver
 *      status returned by the companion service. Badge in the header
 *      reads "Live" and shows the last probe timestamp.
 *
 *   2. **Prober configured but errored** — inline danger Alert with the
 *      error message, then falls back to the simulated rows so the
 *      page isn't blank. Helps the operator notice their prober is
 *      down.
 *
 *   3. **Prober NOT configured** — replaces the entire body with an
 *      EmptyState explaining that real resolver checks require the
 *      companion service, plus a link to the install docs. The
 *      simulated rows are hidden here on purpose: a "Simulated" badge
 *      was too easy to miss and the customer's first-time impression
 *      was that the data was real.
 */

interface Props {
  simulatedResolvers: DnsResolver[];
  prober: UseDnsProberResult;
  hostname: string;
}

const StatusChip: React.FC<{ r: DnsResolver }> = ({ r }) => {
  const style = { color: STATUS_META[r.status].color, fontSize: 14 };
  let icon: React.ReactNode;
  switch (r.status) {
    case 'healthy':
      icon = <CheckCircleIcon style={style} />;
      break;
    case 'pending':
      icon = <ClockIcon style={style} />;
      break;
    case 'failing':
      icon = <ExclamationCircleIcon style={style} />;
      break;
    default:
      icon = <OutlinedQuestionCircleIcon style={style} />;
  }
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: STATUS_META[r.status].color }}>
      {icon}
      {r.result}
    </span>
  );
};

const ResolverRows: React.FC<{ rows: DnsResolver[] }> = ({ rows }) => (
  <Table aria-label="Public resolvers" variant="compact" borders={false}>
    <Thead>
      <Tr>
        <Th>Resolver</Th>
        <Th>Location</Th>
        <Th>IP</Th>
        <Th>Result</Th>
        <Th>Response time</Th>
        <Th>Last checked</Th>
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((r) => (
        <Tr key={r.name}>
          <Td>{r.name}</Td>
          <Td>{r.location}</Td>
          <Td><code style={{ fontSize: 12 }}>{r.ip}</code></Td>
          <Td><StatusChip r={r} /></Td>
          <Td>{r.latencyMs != null ? `${r.latencyMs} ms` : '—'}</Td>
          <Td>
            <span style={{ fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
              {r.lastCheckedIso ? new Date(r.lastCheckedIso).toLocaleTimeString() : '—'}
            </span>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const DNSResolverTable: React.FC<Props> = ({ simulatedResolvers, prober, hostname }) => {
  // Case 3: prober not configured — full-height empty state.
  if (!prober.configured) {
    return (
      <Card aria-label="DNS resolution preview">
        <CardTitle>DNS resolution preview</CardTitle>
        <CardBody>
          <EmptyState
            titleText="Live resolver checks require the DNS Prober companion service"
            headingLevel="h3"
            icon={GlobeIcon}
          >
            <EmptyStateBody>
              The browser has no DNS API, so cross-resolver probing has to run cluster-side. The
              plugin ships with a small Quarkus companion (<code>rhcl-lab/apps/backend/dns-prober</code>)
              that answers <code>POST /api/probe</code>. Once installed, set{' '}
              <code>dnsProberUrl</code> on the <code>custom-rhcl-console-config</code> ConfigMap
              and this table starts showing live per-resolver results for hostname{' '}
              <code>{hostname || '(none)'}</code>.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button
                  variant="secondary"
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/redhat-banco-do-brasil/rhcl-lab/blob/main/tests/dns-prober.md"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="end"
                >
                  Installation docs
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  // Case 1 or 2: prober configured. Header carries "Live" + timestamp
  // (or a spinner while probing). Errors surface inline; on error we
  // fall back to the simulated rows so the page isn't blank.
  return (
    <Card aria-label="DNS resolution preview">
      <CardTitle>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          DNS resolution preview
          {prober.loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <Spinner size="sm" /> probing…
            </span>
          ) : prober.error ? (
            <Tooltip content={prober.error}>
              <Label color="red" isCompact>Prober error</Label>
            </Tooltip>
          ) : (
            <Tooltip
              content={
                prober.probedAt
                  ? `Last probed ${new Date(prober.probedAt).toLocaleTimeString()}`
                  : 'Real cross-resolver checks from the DNS Prober companion service.'
              }
            >
              <Label color="green" isCompact>Live</Label>
            </Tooltip>
          )}
        </span>
      </CardTitle>
      <CardBody>
        {prober.error && (
          <Alert variant="danger" isInline title="DNS Prober is unreachable" style={{ marginBottom: 12 }}>
            {prober.error}. Falling back to a simulated view — cluster-side status only, not real
            probes.
          </Alert>
        )}
        <ResolverRows rows={prober.resolvers || simulatedResolvers} />
      </CardBody>
    </Card>
  );
};

export default DNSResolverTable;
