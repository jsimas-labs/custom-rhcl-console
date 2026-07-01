import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import ChartLineIcon from '@patternfly/react-icons/dist/esm/icons/chart-line-icon';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTempoLink, TempoSearchVars } from '../../utils/tempo';

interface Props {
  /** Search context the trace explorer should open with. */
  vars: TempoSearchVars;
  /** Optional contextual label that follows "View traces". */
  label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  isInline?: boolean;
}

/**
 * Deep-link into the Console's Observe → Traces explorer, scoped to the
 * cluster TempoStack + tenant the rest of the plugin already discovers.
 *
 * When Tempo isn't installed the button stays visible but disabled with
 * a tooltip explaining what's missing — same pattern as
 * OpenInGrafanaButton so the discovery path is consistent.
 *
 * Navigation goes through `react-router-dom` so the Console route
 * transitions stay client-side (no full page reload) and the back
 * button works the way operators expect.
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
    ? t('View traces: {{label}}', { label })
    : t('View traces');

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
          icon={<ChartLineIcon />}
          iconPosition="end"
        >
          {text}
        </Button>
      </Tooltip>
    );
  }

  const linkTo = url ?? '#';
  return (
    <Button
      variant={variant}
      component={(props) => <Link {...props} to={linkTo} />}
      isInline={isInline}
      isLoading={loading}
      icon={<ChartLineIcon />}
      iconPosition="end"
    >
      {text}
    </Button>
  );
};

export default OpenInTempoButton;
