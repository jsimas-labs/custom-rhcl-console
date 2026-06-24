import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
  Label,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { PolicyImpactRow } from './mockOverviewData';

interface Props {
  rows: PolicyImpactRow[];
}

const STATUS_COLOR: Record<PolicyImpactRow['status'], 'green' | 'blue' | 'purple' | 'red' | 'grey'> = {
  enforced: 'green',
  accepted: 'blue',
  overridden: 'purple',
  failed: 'red',
};

const STATUS_LABEL: Record<PolicyImpactRow['status'], string> = {
  enforced: 'Enforced',
  accepted: 'Accepted',
  overridden: 'Overridden',
  failed: 'Failed',
};

/**
 * Policies viewed through an operational lens — what is each policy
 * actually doing? Status is condensed to 4 outcomes; impact column tells
 * the story ("Protecting 1 route", "Not attached", "Overridden by route").
 */
export const PolicyImpactTable: React.FC<Props> = ({ rows }) => {
  return (
    <Card aria-label="Policies and their effective impact">
      <CardTitle>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>Policies</FlexItem>
          <FlexItem>
            <Button variant="link" isInline component="a" href="/k8s/all-namespaces/kuadrant.io~v1~AuthPolicy">
              View all
            </Button>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Table variant="compact" borders={false} aria-label="Policy impact">
          <Thead>
            <Tr>
              <Th>Policy</Th>
              <Th>Namespace</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Effect</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <a href={r.href}>{r.name}</a>
                </Td>
                <Td>{r.namespace}</Td>
                <Td>{r.typeLabel}</Td>
                <Td>
                  <Label
                    isCompact
                    color={STATUS_COLOR[r.status]}
                    variant="outline"
                  >
                    {STATUS_LABEL[r.status]}
                  </Label>
                </Td>
                <Td>
                  <span style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: 13 }}>
                    {r.impact}
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default PolicyImpactTable;
