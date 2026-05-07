import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

interface EmptyRBACStateProps {
  resource: string;
  verb?: string;
  group?: string;
  kind?: string;
}

const EmptyRBACState: React.FC<EmptyRBACStateProps> = ({
  resource,
  verb = 'list',
  group = '',
  kind = '',
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  return (
    <EmptyState
      variant="lg"
      icon={LockIcon}
      titleText={t('No {{resource}} found', { resource })}
      headingLevel="h2"
    >
      <EmptyStateBody>
        {t(
          "You do not have access to view {{resource}}. Contact your cluster administrator to request the '{{verb}}' permission on '{{group}}/{{kind}}'.",
          { resource, verb, group, kind },
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="link"
            component="a"
            href="https://docs.openshift.com/container-platform/latest/authentication/using-rbac.html"
            target="_blank"
          >
            {t('Learn about RBAC')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default EmptyRBACState;
