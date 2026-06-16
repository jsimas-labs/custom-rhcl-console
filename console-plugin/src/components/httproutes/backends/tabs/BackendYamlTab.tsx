import * as React from 'react';
import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import {
  ResourceYAMLEditor, useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { Service } from '../../../../types/backends';
import { ServiceGVK } from '../../../../models';
import { DedupedBackend } from '../utils/dedupeBackends';

interface Props {
  backend: DedupedBackend;
}

/**
 * YAML tab — shows the live Service YAML for the backend, using the
 * console SDK's `ResourceYAMLEditor`. This is the same component the
 * native OpenShift Console uses for its YAML tabs, so the operator gets
 * familiar syntax highlighting, copy-to-clipboard, and (if RBAC allows)
 * edit/save in place.
 *
 * We re-watch the Service here instead of reusing the one from
 * `useBackendsStatus` so the YAML stays in sync with cluster state
 * independently of the parent hook's polling.
 */
export const BackendYamlTab: React.FC<Props> = ({ backend }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [svc, loaded, loadError] = useK8sWatchResource<Service>({
    groupVersionKind: ServiceGVK,
    namespace: backend.namespace,
    name: backend.name,
  });

  if (!loaded) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spinner size="lg" /></div>;
  }
  if (loadError || !svc) {
    return (
      <EmptyState variant="sm" titleText={t('Service unavailable')} headingLevel="h4">
        <EmptyStateBody>
          {t('The Service for this backend could not be loaded from the cluster.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ height: '100%', minHeight: 360 }}>
      <ResourceYAMLEditor initialResource={svc} header={t('Service · {{ns}}/{{n}}', {
        ns: backend.namespace,
        n: backend.name,
      })} />
    </div>
  );
};
