import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
  Button,
  Spinner,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { usePluginConfig } from '../../utils/pluginConfig';

/**
 * Landing component for the "Developer Portal" sidebar item.
 *
 * The OpenShift Console's `console.navigation/href` only accepts internal
 * paths, so we register `/connectivity-link/developer-portal` and use
 * this component to bounce the user to the configured external URL.
 *
 * On mount we attempt `window.open` in a new tab; if the browser's popup
 * blocker rejects it we fall back to an in-page button so the operator
 * still has a one-click path. The nav item itself is hidden when the
 * URL is unset — this component is only reached when it's present, so
 * the empty-URL branch should never render in practice.
 */
const DeveloperPortalRedirect: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const { config, loaded } = usePluginConfig();
  const url = config.developerPortalUrl?.trim();
  const [popupBlocked, setPopupBlocked] = React.useState(false);

  React.useEffect(() => {
    if (!loaded || !url) return;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) setPopupBlocked(true);
  }, [loaded, url]);

  if (!loaded) {
    return (
      <EmptyState
        headingLevel="h2"
        icon={Spinner}
        titleText={t('Loading…')}
      />
    );
  }

  if (!url) {
    return (
      <EmptyState headingLevel="h2" titleText={t('Developer Portal not configured')}>
        <EmptyStateBody>
          {t(
            'Set `developerPortalUrl` in the `custom-rhcl-console-config` ConfigMap to enable this link.',
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <EmptyState
      headingLevel="h2"
      icon={ExternalLinkAltIcon}
      titleText={
        popupBlocked
          ? t('Open the Developer Portal')
          : t('Opening the Developer Portal…')
      }
    >
      <EmptyStateBody>
        {popupBlocked
          ? t(
              'Your browser blocked the automatic redirect. Click the button below to continue.',
            )
          : t('A new tab should be opening. If it does not, use the button below.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            icon={<ExternalLinkAltIcon />}
          >
            {t('Go to Developer Portal')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default DeveloperPortalRedirect;
