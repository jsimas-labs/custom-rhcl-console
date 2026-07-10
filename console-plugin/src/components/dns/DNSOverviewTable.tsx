import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Label,
  Tooltip,
  EmptyState,
  EmptyStateBody,
  Button,
  Progress,
  ProgressSize,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OutlinedQuestionCircleIcon,
  ExternalLinkAltIcon,
  ArrowRightIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { STATUS_META } from './types';
import {
  DnsRecordRow,
  DnsHealthStatus,
} from './useDnsOverview';

interface Props {
  rows: DnsRecordRow[];
  filterOptions: {
    gateways: string[];
    providers: string[];
    namespaces: string[];
  };
}

const STATUS_LABEL: Record<DnsHealthStatus, string> = {
  healthy: 'Healthy',
  propagating: 'Propagating',
  failed: 'Failed',
  unknown: 'Unknown',
};
const STATUS_COLOR: Record<DnsHealthStatus, 'green' | 'orange' | 'red' | 'grey'> = {
  healthy: 'green',
  propagating: 'orange',
  failed: 'red',
  unknown: 'grey',
};
const STATUS_ICON: Record<DnsHealthStatus, React.ReactNode> = {
  healthy: <CheckCircleIcon style={{ color: STATUS_META.healthy.color }} />,
  propagating: <ExclamationTriangleIcon style={{ color: STATUS_META.warning.color }} />,
  failed: <ExclamationCircleIcon style={{ color: STATUS_META.failing.color }} />,
  unknown: <OutlinedQuestionCircleIcon style={{ color: STATUS_META.unknown.color }} />,
};

const FilterSelect: React.FC<{
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Select
      aria-label={label}
      isOpen={isOpen}
      selected={value ?? '__all__'}
      onOpenChange={setIsOpen}
      onSelect={(_e, v) => {
        setIsOpen(false);
        onChange(v === '__all__' || v == null ? null : String(v));
      }}
      toggle={(ref: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={ref}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          style={{ minWidth: 160 }}
        >
          <span style={{ color: 'var(--pf-v5-global--Color--200)', marginRight: 6 }}>
            {label}:
          </span>
          {value ?? 'All'}
        </MenuToggle>
      )}
    >
      <SelectList>
        <SelectOption value="__all__">
          <span style={{ fontStyle: 'italic' }}>All {label.toLowerCase()}s</span>
        </SelectOption>
        {options.map((o) => (
          <SelectOption key={o} value={o}>
            {o}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

function relAgo(iso?: string): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DNSOverviewTable: React.FC<Props> = ({ rows, filterOptions }) => {
  const [search, setSearch] = React.useState('');
  const [gateway, setGateway] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [namespace, setNamespace] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const hay = `${r.hostname} ${r.recordName} ${r.gatewayName || ''} ${r.providerLabel} ${r.target}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (gateway && r.gatewayName !== gateway) return false;
      if (provider && r.providerLabel !== provider) return false;
      if (status && r.status !== status) return false;
      if (namespace && r.namespace !== namespace) return false;
      return true;
    });
  }, [rows, search, gateway, provider, status, namespace]);

  const totalLabel = `${filtered.length}${filtered.length !== rows.length ? ` of ${rows.length}` : ''}`;

  return (
    <Card aria-label="DNS records" className="rhcl-dns-overview-panel">
      <CardTitle>DNS Records ({totalLabel})</CardTitle>
      <CardBody>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem style={{ minWidth: 260 }}>
              <SearchInput
                placeholder="Search hostnames, records, gateways…"
                value={search}
                onChange={(_e, v) => setSearch(v)}
                onClear={() => setSearch('')}
                aria-label="Search"
              />
            </ToolbarItem>
            <ToolbarItem>
              <FilterSelect label="Gateway" value={gateway} options={filterOptions.gateways} onChange={setGateway} />
            </ToolbarItem>
            <ToolbarItem>
              <FilterSelect label="Provider" value={provider} options={filterOptions.providers} onChange={setProvider} />
            </ToolbarItem>
            <ToolbarItem>
              <FilterSelect
                label="Status"
                value={status}
                options={['healthy', 'propagating', 'failed', 'unknown']}
                onChange={setStatus}
              />
            </ToolbarItem>
            <ToolbarItem>
              <FilterSelect label="Namespace" value={namespace} options={filterOptions.namespaces} onChange={setNamespace} />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            titleText={rows.length === 0 ? 'No DNS records detected' : 'Nothing matches your filters'}
            headingLevel="h4"
            icon={SearchIcon}
          >
            <EmptyStateBody>
              {rows.length === 0
                ? 'Create a DNSPolicy to publish DNS records for a Gateway. Once Kuadrant reconciles, records will show up here automatically.'
                : 'Clear a filter or the search query to see more rows.'}
            </EmptyStateBody>
            {rows.length === 0 && (
              <Button
                variant="primary"
                component={(props) => <Link {...props} to="/connectivity-link/policies/create/dnspolicy" />}
                style={{ marginTop: 12 }}
              >
                Create DNSPolicy
              </Button>
            )}
          </EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table aria-label="DNS records" variant="compact" borders={false}>
              <Thead>
                <Tr>
                  <Th>Hostname</Th>
                  <Th>Gateway</Th>
                  <Th>Type</Th>
                  <Th>Target</Th>
                  <Th>DNS Provider</Th>
                  <Th>Status</Th>
                  <Th>Propagation</Th>
                  <Th>Public Resolution</Th>
                  <Th>Last Checked</Th>
                  <Th aria-label="Actions" />
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r) => {
                  const propColor =
                    r.propagationPct >= 90
                      ? STATUS_META.healthy.color
                      : r.propagationPct >= 40
                      ? STATUS_META.warning.color
                      : STATUS_META.failing.color;
                  const resColor =
                    r.resolutionPct >= 90
                      ? STATUS_META.healthy.color
                      : r.resolutionPct >= 40
                      ? STATUS_META.warning.color
                      : STATUS_META.failing.color;
                  return (
                    <Tr key={r.id}>
                      <Td>
                        <Link to={r.href.troubleshooting} className="rhcl-dns-overview-hostname">
                          {r.hostname}
                        </Link>
                      </Td>
                      <Td>{r.gatewayName || '—'}</Td>
                      <Td>{r.recordType}</Td>
                      <Td>
                        <Tooltip content={r.targets.join(', ') || r.target}>
                          <code style={{ fontSize: 12 }}>{r.target}</code>
                        </Tooltip>
                      </Td>
                      <Td>{r.providerLabel}</Td>
                      <Td>
                        <Label color={STATUS_COLOR[r.status]} icon={STATUS_ICON[r.status]} isCompact>
                          {STATUS_LABEL[r.status]}
                        </Label>
                      </Td>
                      <Td style={{ minWidth: 140 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ minWidth: 40, textAlign: 'right', fontSize: 12, fontWeight: 500 }}>
                            {r.propagationPct}%
                          </span>
                          <span style={{ flex: 1 }}>
                            <Progress
                              value={r.propagationPct}
                              size={ProgressSize.sm}
                              aria-label={`Propagation ${r.propagationPct}%`}
                              measureLocation={"none" as never}
                              style={{ ['--pf-v5-c-progress__bar--BackgroundColor' as never]: propColor }}
                            />
                          </span>
                        </span>
                      </Td>
                      <Td>
                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {r.resolution === 'resolved' ? (
                            <CheckCircleIcon style={{ color: resColor }} />
                          ) : r.resolution === 'unresolved' ? (
                            <ExclamationCircleIcon style={{ color: resColor }} />
                          ) : (
                            <OutlinedQuestionCircleIcon style={{ color: resColor }} />
                          )}
                          <span style={{ color: resColor, fontWeight: 500 }}>
                            {r.resolution === 'unknown' ? '—' : `${r.resolutionPct}%`}
                          </span>
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
                          {relAgo(r.lastCheckedIso)}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ display: 'inline-flex', gap: 4 }}>
                          <Tooltip content="Open DNS Troubleshooting">
                            <Button
                              variant="plain"
                              aria-label="Open troubleshooting"
                              component={(props) => (
                                <Link {...props} to={r.href.troubleshooting} />
                              )}
                            >
                              <ArrowRightIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Open DNSRecord">
                            <Button
                              variant="plain"
                              aria-label="Open record"
                              component={(props) => (
                                <Link {...props} to={r.href.record} />
                              )}
                            >
                              <ExternalLinkAltIcon />
                            </Button>
                          </Tooltip>
                        </span>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DNSOverviewTable;
