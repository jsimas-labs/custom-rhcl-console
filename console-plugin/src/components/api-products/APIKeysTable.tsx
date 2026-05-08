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
  Title,
  Tooltip,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  useK8sWatchResource,
  useAccessReview,
  k8sPatch,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { APIKeyGVK } from '../../models';
import { APIKey } from '../../types';

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

const APIKeysTable: React.FC<APIKeysTableProps> = ({
  apiProductName,
  namespace,
  approvalMode,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [apiKeys, loaded] = useK8sWatchResource<APIKey[]>({
    groupVersionKind: APIKeyGVK,
    isList: true,
    namespace,
  });

  const [canUpdate] = useAccessReview({
    group: APIKeyGVK.group,
    resource: 'apikeys',
    verb: 'update',
    namespace,
  });

  const filteredKeys = React.useMemo(
    () =>
      (apiKeys || []).filter(
        (key) => key.spec.apiProductRef.name === apiProductName,
      ),
    [apiKeys, apiProductName],
  );

  const handleAction = async (key: APIKey, action: 'Approved' | 'Rejected') => {
    try {
      await k8sPatch({
        model: {
          apiVersion: `${APIKeyGVK.group}/${APIKeyGVK.version}`,
          apiGroup: APIKeyGVK.group,
          kind: APIKeyGVK.kind,
          plural: 'apikeys',
          abbr: 'AK',
          label: 'APIKey',
          labelPlural: 'APIKeys',
          namespaced: true,
        },
        resource: key,
        data: [
          {
            op: 'replace',
            path: '/status/phase',
            value: action,
          },
        ],
      });
    } catch (e) {
      console.error(`Failed to ${action.toLowerCase()} API key:`, e);
    }
  };

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
          <EmptyState variant="sm">
            <Title headingLevel="h4" size="md">
              {t('No API keys')}
            </Title>
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
                {approvalMode === 'manual' && <Th>Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredKeys.map((key) => {
                const phase = key.status?.phase || 'Pending';
                const isPending = phase === 'Pending';

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
                              {canUpdate ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAction(key, 'Approved')}
                                >
                                  {t('Approve')}
                                </Button>
                              ) : (
                                <Tooltip content={t('You do not have permission to approve API keys')}>
                                  <Button variant="primary" size="sm" isDisabled>
                                    {t('Approve')}
                                  </Button>
                                </Tooltip>
                              )}
                            </FlexItem>
                            <FlexItem>
                              {canUpdate ? (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleAction(key, 'Rejected')}
                                >
                                  {t('Reject')}
                                </Button>
                              ) : (
                                <Tooltip content={t('You do not have permission to reject API keys')}>
                                  <Button variant="danger" size="sm" isDisabled>
                                    {t('Reject')}
                                  </Button>
                                </Tooltip>
                              )}
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

export default APIKeysTable;
