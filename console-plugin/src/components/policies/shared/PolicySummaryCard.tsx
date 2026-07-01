import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PolicyResource } from './types';
import { PolicyTargetReference } from '../../../types/common';

interface Props {
  policy: PolicyResource;
  description?: string;
  targetRef?: PolicyTargetReference;
  scope?: string;
}

function isoToHuman(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/**
 * Metadata summary — replaces the "describe -o yaml" wall with a clean
 * 2-column DescriptionList. Same fields across every policy kind so the
 * eye knows where to find description / target / scope.
 */
export const PolicySummaryCard: React.FC<Props> = ({
  policy,
  description,
  targetRef,
  scope,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const owner = policy.metadata?.ownerReferences?.[0]?.name;
  return (
    <Card>
      <CardTitle>{t('Summary')}</CardTitle>
      <CardBody>
        <DescriptionList isCompact isHorizontal columnModifier={{ default: '2Col' }}>
          {description && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
              <DescriptionListDescription>{description}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
            <DescriptionListDescription>
              {policy.metadata?.namespace || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Owner')}</DescriptionListTerm>
            <DescriptionListDescription>
              {owner || t('No owner')}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Target kind')}</DescriptionListTerm>
            <DescriptionListDescription>
              {targetRef?.kind || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Target name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {targetRef?.name || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {scope && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Scope')}</DescriptionListTerm>
              <DescriptionListDescription>{scope}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
            <DescriptionListDescription>
              {isoToHuman(policy.metadata?.creationTimestamp)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default PolicySummaryCard;
