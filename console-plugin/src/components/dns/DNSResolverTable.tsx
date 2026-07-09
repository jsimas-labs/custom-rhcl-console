import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Tooltip,
  Label,
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
} from '@patternfly/react-icons';
import { DnsResolver, STATUS_META } from './types';

/**
 * Cross-resolver table — shows how each public DNS resolver responds
 * for the current hostname.
 *
 * **Honest disclaimer:** the browser has no DNS API. The row status is
 * derived from the cluster-side pipeline state (see
 * useDnsTroubleshooting.synthResolvers) so it isn't obviously wrong,
 * but a real prober lives server-side. The header carries a small
 * "Simulated" label so an operator on the page understands they're
 * seeing a plausible reading, not a probed one.
 */

interface Props {
  resolvers: DnsResolver[];
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

const DNSResolverTable: React.FC<Props> = ({ resolvers }) => (
  <Card aria-label="DNS resolution preview">
    <CardTitle>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        DNS resolution preview
        <Tooltip content="Live probing requires a backend resolver service. The rows below are derived from the cluster-side pipeline status so they track propagation direction, but they are not live dig() results.">
          <Label color="grey" isCompact>Simulated</Label>
        </Tooltip>
      </span>
    </CardTitle>
    <CardBody>
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
          {resolvers.map((r) => (
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
    </CardBody>
  </Card>
);

export default DNSResolverTable;
