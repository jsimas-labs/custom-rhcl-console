import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { useTranslation } from 'react-i18next';
import { useTempoLink, TempoSearchVars } from '../../utils/tempo';

interface Props {
  /** Filters passed to the Tempo gateway Jaeger UI search. */
  vars: TempoSearchVars;
  /** Optional contextual label that follows "View trace". */
  label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  isInline?: boolean;
}

/**
 * Deep-link into the cluster's Tempo gateway, pre-filtering the Jaeger UI
 * by service name + tags. When Tempo isn't installed the button stays
 * visible but disabled, with a tooltip explaining what's missing — same
 * pattern as OpenInGrafanaButton so the discovery path is consistent.
 */
export const OpenInTempoButton: React.FC<Props> = ({
  vars,
  label,
  variant = 'secondary',
  isInline,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { url, loading, available } = useTempoLink(vars);

  const text = label
    ? t('View trace: {{label}}', { label })
    : t('View trace');

  if (!available) {
    return (
      <Tooltip
        content={t(
          'Tempo is not installed on this cluster. Run the observability role (or playbooks/observability-install.yml) to enable.',
        )}
      >
        <Button
          variant={variant}
          isDisabled
          isAriaDisabled
          isInline={isInline}
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
        >
          {text}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={variant}
      component="a"
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      isInline={isInline}
      isLoading={loading}
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      {text}
    </Button>
  );
};

export default OpenInTempoButton;
