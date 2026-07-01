import * as React from 'react';
import { Card, CardTitle, CardBody } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  children: React.ReactNode;
}

/**
 * Container slot for the kind-specific configuration (auth rules, rate
 * limit limits, DNS strategy, TLS handshake config, …). Keeps the
 * outer Card chrome consistent across pages.
 */
export const PolicyConfigurationCard: React.FC<Props> = ({ title, children }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  return (
    <Card>
      <CardTitle>{title || t('Policy Configuration')}</CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default PolicyConfigurationCard;
