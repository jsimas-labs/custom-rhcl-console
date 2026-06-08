import * as React from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Flex,
  FlexItem,
  Label,
  Tooltip,
  Icon,
  ClipboardCopy,
  ExpandableSection,
} from '@patternfly/react-core';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ProbeResult, useProbeHistory } from '../../hooks/useProbeHistory';
import { useServiceProbe } from '../../hooks/useServiceProbe';

interface RouteSyntheticProbeProps {
  routeUid: string | undefined;
  routeHostname: string;          // for the "Copy curl" external command
  backendNamespace: string;
  backendName: string;
  backendPort: number;
  defaultPath: string;            // first match path from the route, else "/"
  httpsBackend?: boolean;         // appProtocol === 'https' on the Service port
}

/**
 * "Test connection" widget for a single backend. Fires a probe through
 * the Kubernetes API server's Service proxy (see useServiceProbe for
 * why), records the result in localStorage, and renders a trend strip
 * of the last 5 probes for quick visual scanning.
 *
 * Two complementary outputs:
 *   1. The in-plugin probe button (default) — bypasses CORS / TLS.
 *   2. A "Copy curl" snippet against the route's external hostname —
 *      for operators who want to verify the full Envoy + AuthPolicy +
 *      Limitador path end-to-end.
 */
export const RouteSyntheticProbe: React.FC<RouteSyntheticProbeProps> = ({
  routeUid,
  routeHostname,
  backendNamespace,
  backendName,
  backendPort,
  defaultPath,
  httpsBackend,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { probe } = useServiceProbe();
  const { history, record, clear } = useProbeHistory(routeUid, backendNamespace, backendName);

  const [path, setPath] = React.useState(defaultPath || '/');
  const [running, setRunning] = React.useState(false);
  const [headerName, setHeaderName] = React.useState('');
  const [headerValue, setHeaderValue] = React.useState('');

  const onProbe = React.useCallback(async () => {
    setRunning(true);
    const extraHeaders: Record<string, string> = {};
    if (headerName.trim()) extraHeaders[headerName.trim()] = headerValue;
    const result = await probe({
      namespace: backendNamespace,
      serviceName: backendName,
      port: backendPort,
      path,
      extraHeaders,
      https: httpsBackend,
    });
    record(result);
    setRunning(false);
  }, [probe, record, backendNamespace, backendName, backendPort, path, headerName, headerValue, httpsBackend]);

  const last = history[0];
  const curl = buildCurl(routeHostname, path, headerName, headerValue);

  return (
    <div>
      <Form isHorizontal>
        <FormGroup label={t('Path')} fieldId="probe-path">
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <TextInput
                id="probe-path"
                value={path}
                onChange={(_e, v) => setPath(v)}
                placeholder="/"
              />
            </FlexItem>
            <FlexItem>
              <Button variant="primary" onClick={onProbe} isDisabled={running}>
                {running ? t('Probing…') : t('Probe')}
              </Button>
            </FlexItem>
          </Flex>
        </FormGroup>
      </Form>

      <ExpandableSection toggleText={t('Optional header (api-key, Authorization, …)')}>
        <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: 8 }}>
          <FlexItem>
            <TextInput
              aria-label="header name"
              placeholder={t('Header name')}
              value={headerName}
              onChange={(_e, v) => setHeaderName(v)}
            />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_2' }}>
            <TextInput
              aria-label="header value"
              placeholder={t('Header value')}
              value={headerValue}
              onChange={(_e, v) => setHeaderValue(v)}
            />
          </FlexItem>
        </Flex>
      </ExpandableSection>

      {last && (
        <div style={{ marginTop: 12 }}>
          <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <StatusBadge status={last.status} />
            </FlexItem>
            <FlexItem>
              <span style={{ fontFamily: 'monospace' }}>{last.durationMs} ms</span>
            </FlexItem>
            <FlexItem>
              <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                {new Date(last.timestamp).toLocaleTimeString()}
              </small>
            </FlexItem>
            {last.error && (
              <FlexItem>
                <Tooltip content={last.error}>
                  <Label color="red" isCompact>{t('error')}</Label>
                </Tooltip>
              </FlexItem>
            )}
          </Flex>
          {last.status === 401 || last.status === 403 ? (
            <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
              {t('Auth challenge — the auth layer is enforcing. Probe succeeded.')}
            </small>
          ) : null}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
                {t('Last {{n}} probes', { n: history.length })}
              </small>
            </FlexItem>
            <FlexItem>
              <TrendStrip history={history} />
            </FlexItem>
            <FlexItem>
              <TrendIcon history={history} />
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <Button variant="link" isInline onClick={clear}>
                {t('Clear')}
              </Button>
            </FlexItem>
          </Flex>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <small style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
          {t('To test the full path via Envoy (route + AuthPolicy + Limitador), use:')}
        </small>
        <ClipboardCopy hoverTip={t('Copy')} clickTip={t('Copied')} variant="expansion" isReadOnly>
          {curl}
        </ClipboardCopy>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: number }> = ({ status }) => {
  if (status === 0) return <Label color="red">—</Label>;
  const color: 'green' | 'orange' | 'red' | 'grey' =
    status >= 200 && status < 300 ? 'green'
    : status >= 300 && status < 400 ? 'grey'
    : status >= 400 && status < 500 ? 'orange'
    : status >= 500 ? 'red'
    : 'grey';
  return <Label color={color}>{`HTTP ${status}`}</Label>;
};

// 5-cell strip: each cell colored by status, oldest left, newest right.
// We render right-to-left so the rightmost cell is the latest probe —
// matches the operator's mental model of "what just happened".
const TrendStrip: React.FC<{ history: ProbeResult[] }> = ({ history }) => {
  // history is newest-first per the hook; reverse so visually it reads
  // left = oldest, right = newest.
  const cells = [...history].reverse();
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {cells.map((r, idx) => (
        <Tooltip
          key={idx}
          content={`HTTP ${r.status || '—'} · ${r.durationMs} ms · ${new Date(r.timestamp).toLocaleTimeString()}`}
        >
          <span
            style={{
              display: 'inline-block',
              width: 14, height: 14, borderRadius: 2,
              background: cellColor(r.status),
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
};

// Compares the latest two probes — that's enough to give an arrow that
// matches what the operator just experienced. Over 5 probes we mostly care
// about "is the latest worse than the one before it".
const TrendIcon: React.FC<{ history: ProbeResult[] }> = ({ history }) => {
  if (history.length < 2) return null;
  const [latest, prev] = history;
  const latestOk = latest.status >= 200 && latest.status < 400;
  const prevOk = prev.status >= 200 && prev.status < 400;
  if (latestOk && !prevOk) {
    return (
      <Tooltip content="Recovered">
        <Icon status="success"><ArrowUpIcon /></Icon>
      </Tooltip>
    );
  }
  if (!latestOk && prevOk) {
    return (
      <Tooltip content="Degraded">
        <Icon status="danger"><ArrowDownIcon /></Icon>
      </Tooltip>
    );
  }
  return (
    <Tooltip content="Stable">
      <Icon><MinusIcon /></Icon>
    </Tooltip>
  );
};

function cellColor(status: number): string {
  if (status === 0) return 'var(--pf-t--global--color--status--danger--default)';
  if (status >= 200 && status < 300) return 'var(--pf-t--global--color--status--success--default)';
  if (status >= 300 && status < 400) return 'var(--pf-t--global--color--nonstatus--gray--default)';
  if (status >= 400 && status < 500) return 'var(--pf-t--global--color--status--warning--default)';
  return 'var(--pf-t--global--color--status--danger--default)';
}

function buildCurl(host: string, path: string, headerName: string, headerValue: string): string {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const hd = headerName.trim() ? ` \\\n  -H '${headerName.trim()}: ${headerValue}'` : '';
  return `curl -sk -w 'http=%{http_code} time=%{time_total}s\\n' \\\n  https://${host}${safePath}${hd}`;
}
