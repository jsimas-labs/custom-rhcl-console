import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HTTPRoute } from '../../../../types/httproute';
import { RouteSyntheticProbe } from '../../RouteSyntheticProbe';
import { DedupedBackend } from '../utils/dedupeBackends';

interface Props {
  backend: DedupedBackend;
  route: HTTPRoute | undefined;
}

/**
 * Probe tab. Wraps the existing `RouteSyntheticProbe` widget unchanged.
 *
 * Unlike the old card layout — where the probe sat inline under every
 * backend, even when the operator wasn't troubleshooting — here the
 * probe is one tab deep. You have to *want* it to see it. That's the
 * point: probe is a debugging action, not a monitoring view.
 *
 * Default path resolution lives here (was duplicated in the parent tab
 * before) — walk rules in order and take the first match.path.value.
 */
export const BackendProbeTab: React.FC<Props> = ({ backend, route }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const defaultPath = React.useMemo(() => {
    for (const rule of route?.spec?.rules ?? []) {
      for (const m of rule.matches ?? []) {
        if (m.path?.value) return m.path.value;
      }
    }
    return '/';
  }, [route]);

  // Detect HTTPS service ports — controls the scheme the probe URL will use.
  // Mirrors the logic the old card had inline; keeping it here so the probe
  // widget itself stays generic.
  const portObj = backend.service?.spec?.ports?.find((p) => p.port === backend.port);
  const isHttps = portObj?.appProtocol === 'https' || portObj?.name === 'https';

  return (
    <div style={{ padding: 16 }}>
      <Alert
        variant="info"
        isInline
        isPlain
        title={t('Probes bypass the gateway')}
        style={{ marginBottom: 12 }}
      >
        {t('Probes hit the backend Service directly through the K8s API server proxy. To test the full gateway path (auth, rate-limit, retries), use the generated curl snippet below.')}
      </Alert>
      <RouteSyntheticProbe
        routeUid={route?.metadata?.uid}
        routeHostname={route?.spec?.hostnames?.[0] ?? ''}
        backendNamespace={backend.namespace}
        backendName={backend.name}
        backendPort={backend.port ?? 80}
        defaultPath={defaultPath}
        httpsBackend={isHttps}
      />
    </div>
  );
};
