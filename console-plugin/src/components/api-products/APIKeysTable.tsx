import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Button,
  Label,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Tooltip,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  useK8sWatchResource,
  useAccessReview,
  k8sCreate,
  consoleFetchJSON,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { APIKeyGVK, APIKeyRequestGVK, APIKeyApprovalGVK } from '../../models';
import { APIKey, APIKeyApproval, APIKeyRequest, getAPIKeyPhase } from '../../types';

interface APIKeysTableProps {
  apiProductName: string;
  namespace: string;
  approvalMode: string;
}

const PHASE_COLORS: Record<string, 'blue' | 'green' | 'red' | 'grey'> = {
  Pending: 'blue',
  Approved: 'green',
  Rejected: 'red',
};

/**
 * Approval workflow note (Kuadrant 1.4+).
 *
 * The naive "patch the APIKey's status.phase" approach this component used
 * to take does not work on the current devportal.kuadrant.io CRDs:
 *   - The APIKey schema no longer exposes `status.phase`; phase is read
 *     from `status.conditions[*]` via `getAPIKeyPhase`.
 *   - The status subresource is owned by the devportal controller — the
 *     console can't (and shouldn't) overwrite it directly.
 *
 * The correct flow, matching what the upstream Kuadrant console plugin
 * does, is:
 *
 *   1. The controller auto-creates an `APIKeyRequest` for every APIKey.
 *   2. To approve/reject, the operator creates an `APIKeyApproval` CR
 *      whose `spec.apiKeyRequestRef.name` points at that request.
 *   3. The controller reconciles the approval and updates the APIKey's
 *      `status.conditions` accordingly.
 *
 * That's the workflow we implement here. The Approve/Reject buttons
 * create an `APIKeyApproval` per click; the table reflects new state via
 * the live watch on APIKey conditions, no refresh needed.
 */
const APIKeysTable: React.FC<APIKeysTableProps> = ({
  apiProductName,
  namespace,
  approvalMode,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [apiKeys, keysLoaded] = useK8sWatchResource<APIKey[]>({
    groupVersionKind: APIKeyGVK,
    isList: true,
    namespace,
  });

  // Need the APIKeyRequest list too — approval points at requests, not at
  // APIKeys, and the request name is opaque (`<ns>-<apikey>-<hash>`), so
  // we have to look it up by `spec.apiKeyRef.name` matching the APIKey.
  const [apiKeyRequests, requestsLoaded] = useK8sWatchResource<APIKeyRequest[]>({
    groupVersionKind: APIKeyRequestGVK,
    isList: true,
    namespace,
  });

  // RBAC: do we have permission to create APIKeyApproval CRs? If not, the
  // Approve/Reject buttons stay disabled with a tooltip explaining why.
  // Note this is `create` on APIKeyApproval (not `update` on APIKey).
  const [canCreateApproval] = useAccessReview({
    group: APIKeyApprovalGVK.group,
    resource: 'apikeyapprovals',
    verb: 'create',
    namespace,
  });

  // The whoami response shape OCP uses for the kube console; missing in
  // some deployment modes — guard with optional chaining, fall back to the
  // string "console" so the audit trail still has something useful.
  const [reviewer, setReviewer] = React.useState<string>('console');
  React.useEffect(() => {
    consoleFetchJSON('/apis/user.openshift.io/v1/users/~')
      .then((u: { metadata?: { name?: string } }) => {
        if (u?.metadata?.name) setReviewer(u.metadata.name);
      })
      .catch(() => undefined); // anonymous / unknown user — keep default
  }, []);

  const filteredKeys = React.useMemo(
    () =>
      (apiKeys || []).filter(
        (key) => key.spec.apiProductRef.name === apiProductName,
      ),
    [apiKeys, apiProductName],
  );

  // Build a quick lookup: APIKey name → APIKeyRequest name. Multiple
  // requests for the same key would be unusual but we pick the first
  // match for determinism — the controller normally only ever issues one.
  const requestByApiKey = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const r of apiKeyRequests || []) {
      const k = r.spec?.apiKeyRef?.name;
      if (k && !m.has(k)) m.set(k, r.metadata?.name || '');
    }
    return m;
  }, [apiKeyRequests]);

  // Approve/reject action — creates an APIKeyApproval CR. The unique-
  // looking name buys us idempotency-by-time-window: clicking twice in the
  // same second creates one CR, clicking again later creates a new audit
  // entry the controller will collapse to the latest reviewedAt.
  const handleAction = async (
    apiKey: APIKey,
    action: 'Approved' | 'Rejected',
  ) => {
    const keyName = apiKey.metadata?.name || '';
    const requestName = requestByApiKey.get(keyName);
    if (!requestName) {
      // The request CR was supposed to be auto-created but isn't there yet
      // — surface the cause to the console instead of failing silently.
      console.error(
        `Can't ${action.toLowerCase()} ${keyName}: no APIKeyRequest pointing at it. ` +
        'Wait a moment and retry; the devportal controller creates the request asynchronously.',
      );
      return;
    }

    const now = new Date().toISOString();
    const stamp = now.replace(/[:.]/g, '-').toLowerCase();
    const approval: APIKeyApproval = {
      apiVersion: `${APIKeyApprovalGVK.group}/${APIKeyApprovalGVK.version}`,
      kind: APIKeyApprovalGVK.kind,
      metadata: {
        // <apikey>-<approved|rejected>-<isotime> — readable in `oc get`
        // and unique enough that double-clicks don't collide.
        name: `${keyName}-${action.toLowerCase()}-${stamp}`.slice(0, 253),
        namespace,
      },
      spec: {
        apiKeyRequestRef: { name: requestName },
        approved: action === 'Approved',
        reviewedAt: now,
        reviewedBy: reviewer,
        reason: action === 'Approved' ? 'ApprovedByConsole' : 'RejectedByConsole',
      },
    };

    try {
      await k8sCreate({
        // K8sModel.apiVersion is the VERSION ALONE (e.g. "v1alpha1"), not the
        // `group/version` pair. apiGroup carries the group. The SDK joins them
        // into the URL `/apis/{apiGroup}/{apiVersion}/namespaces/{ns}/{plural}`.
        // Passing "devportal.kuadrant.io/v1alpha1" here would yield a doubled
        // path and a 404 from the API server — the silent failure that hid the
        // first iteration of this action.
        model: {
          apiVersion: APIKeyApprovalGVK.version,
          apiGroup: APIKeyApprovalGVK.group,
          kind: APIKeyApprovalGVK.kind,
          plural: 'apikeyapprovals',
          abbr: 'AKA',
          label: APIKeyApprovalGVK.kind,
          labelPlural: 'APIKeyApprovals',
          namespaced: true,
        },
        data: approval,
      });
    } catch (e) {
      console.error(`Failed to ${action.toLowerCase()} API key ${keyName}:`, e);
    }
  };

  const loaded = keysLoaded && requestsLoaded;
  if (!loaded) {
    return (
      <Card>
        <CardTitle>{t('API Keys')}</CardTitle>
        <CardBody><Spinner size="lg" /></CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>
        {t('API Keys')} ({filteredKeys.length} {t('total')})
      </CardTitle>
      <CardBody>
        {filteredKeys.length === 0 ? (
          <EmptyState variant="sm" titleText={t('No API keys')} headingLevel="h4">
            <EmptyStateBody>
              {t('No API key requests have been submitted for this API product.')}
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Table aria-label={t('API Keys')} variant="compact">
            <Thead>
              <Tr>
                <Th>{t('Requester')}</Th>
                <Th>{t('Plan')}</Th>
                <Th>{t('Phase')}</Th>
                <Th>{t('Created')}</Th>
                {approvalMode === 'manual' && <Th>{t('Actions')}</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredKeys.map((key) => {
                const phase = getAPIKeyPhase(key);
                const isPending = phase === 'Pending';
                const hasRequest = !!requestByApiKey.get(key.metadata?.name || '');

                return (
                  <Tr key={key.metadata?.uid}>
                    <Td>{key.spec.requestedBy?.email || '-'}</Td>
                    <Td>{key.spec.planTier || '-'}</Td>
                    <Td>
                      <Label color={PHASE_COLORS[phase] || 'grey'}>
                        {t(phase)}
                      </Label>
                    </Td>
                    <Td>{key.metadata?.creationTimestamp || '-'}</Td>
                    {approvalMode === 'manual' && (
                      <Td>
                        {isPending && (
                          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                            <FlexItem>
                              <ActionButton
                                kind="primary"
                                disabled={!canCreateApproval || !hasRequest}
                                tooltipWhenDisabled={
                                  !canCreateApproval
                                    ? t('You do not have permission to approve API keys')
                                    : t('APIKeyRequest not yet observed — wait and retry')
                                }
                                onClick={() => handleAction(key, 'Approved')}
                                label={t('Approve')}
                              />
                            </FlexItem>
                            <FlexItem>
                              <ActionButton
                                kind="danger"
                                disabled={!canCreateApproval || !hasRequest}
                                tooltipWhenDisabled={
                                  !canCreateApproval
                                    ? t('You do not have permission to reject API keys')
                                    : t('APIKeyRequest not yet observed — wait and retry')
                                }
                                onClick={() => handleAction(key, 'Rejected')}
                                label={t('Reject')}
                              />
                            </FlexItem>
                          </Flex>
                        )}
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * Tiny helper to flatten the "render disabled button + tooltip" boilerplate.
 * Without it we were duplicating the same ternary 4 times.
 */
const ActionButton: React.FC<{
  kind: 'primary' | 'danger';
  disabled: boolean;
  tooltipWhenDisabled: string;
  label: string;
  onClick: () => void;
}> = ({ kind, disabled, tooltipWhenDisabled, label, onClick }) => {
  const btn = (
    <Button variant={kind} size="sm" isDisabled={disabled} onClick={disabled ? undefined : onClick}>
      {label}
    </Button>
  );
  return disabled ? <Tooltip content={tooltipWhenDisabled}>{btn}</Tooltip> : btn;
};

export default APIKeysTable;
