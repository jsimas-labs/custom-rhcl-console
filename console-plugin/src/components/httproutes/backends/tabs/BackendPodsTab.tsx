import * as React from 'react';
import {
  DataList, DataListItem, DataListItemRow, DataListItemCells, DataListCell,
  EmptyState, EmptyStateBody, Label,
} from '@patternfly/react-core';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { DedupedBackend } from '../utils/dedupeBackends';

interface Props {
  backend: DedupedBackend;
}

/**
 * Pods tab. We deliberately keep pod names *out* of the table — they're
 * implementation details that churn on every deploy, and a column of them
 * eats the real estate that traffic/error columns need.
 *
 * Here they get the room and the link. Each row is a `ResourceLink` to
 * the pod's detail page so the operator can drill into describe/logs/events
 * without leaving the console.
 *
 * Ready/Not-Ready badge per pod isn't available here because
 * `useBackendsStatus` flattens EndpointSlice endpoints into a name list
 * (the `ready` bit lives at the endpoint level, not the pod level). The
 * counts on the Overview tab already convey global readiness.
 */
export const BackendPodsTab: React.FC<Props> = ({ backend }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  if (backend.podNames.length === 0) {
    return (
      <EmptyState variant="sm" titleText={t('No pods')} headingLevel="h4">
        <EmptyStateBody>
          {t('No pod is currently selected by this Service. If the Deployment is running, it may still be rolling out — give it a minute.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
          {t('Pods backing this Service ({{ready}}/{{total}} ready)', {
            ready: backend.readyEndpoints,
            total: backend.totalEndpoints,
          })}
        </span>
        <Label
          color={
            backend.totalEndpoints > 0 && backend.readyEndpoints === backend.totalEndpoints
              ? 'green'
              : backend.totalEndpoints > 0 && backend.readyEndpoints === 0
              ? 'red'
              : 'orange'
          }
          isCompact
        >
          {`${backend.podNames.length} ${t('pods')}`}
        </Label>
      </div>

      <DataList aria-label={t('Pods')} isCompact>
        {backend.podNames.map((podName) => (
          <DataListItem key={podName} aria-labelledby={`pod-${podName}`}>
            <DataListItemRow>
              <DataListItemCells dataListCells={[
                <DataListCell key="link" id={`pod-${podName}`}>
                  <ResourceLink
                    kind="Pod"
                    name={podName}
                    namespace={backend.namespace}
                  />
                </DataListCell>,
              ]} />
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
    </div>
  );
};
