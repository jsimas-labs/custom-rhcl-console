import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import Sparkline from './Sparkline';
import { RouteTrafficRow } from './mockOverviewData';

interface Props {
  rows: RouteTrafficRow[];
}

/**
 * HTTPRoutes with operational signals: requests/min, error rate,
 * attached policy count, mini traffic trend.
 */
export const RouteTrafficTable: React.FC<Props> = ({ rows }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  return (
    <Card aria-label={t('HTTPRoutes traffic')}>
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>{t('HTTPRoutes')}</FlexItem>
          <FlexItem>
            <Button variant="link" isInline component="a" href="/k8s/all-namespaces/gateway.networking.k8s.io~v1~HTTPRoute">
              {t('View all')}
            </Button>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Table variant="compact" borders={false} aria-label={t('HTTPRoute traffic')}>
          <Thead>
            <Tr>
              <Th>{t('Route')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Gateway')}</Th>
              <Th>{t('Requests / min')}</Th>
              <Th>{t('Trend')}</Th>
              <Th>{t('Error Rate')}</Th>
              <Th>{t('Policies')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => {
              const errorTone = r.errorRatePct >= 5 ? 'bad' : r.errorRatePct >= 1 ? 'warn' : 'good';
              const errorColor =
                errorTone === 'bad' ? 'var(--pf-v5-global--danger-color--100)' :
                errorTone === 'warn' ? 'var(--pf-v5-global--warning-color--100)' :
                'var(--pf-v5-global--success-color--100)';
              return (
                <Tr key={r.id}>
                  <Td>
                    <a href={r.href}>{r.name}</a>
                  </Td>
                  <Td>{r.namespace}</Td>
                  <Td>{r.gatewayName}</Td>
                  <Td>{r.requestsPerMin.toLocaleString('en-US')}</Td>
                  <Td>
                    <div style={{ color: 'var(--pf-v5-global--info-color--100)' }}>
                      <Sparkline data={r.sparkline} width={90} height={28} strokeWidth={1.25} />
                    </div>
                  </Td>
                  <Td>
                    <span style={{ color: errorColor, fontWeight: 500 }}>
                      {r.errorRatePct}%
                    </span>
                  </Td>
                  <Td>{r.policiesCount}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default RouteTrafficTable;
