import * as React from 'react';
import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { usePluginConfig } from '../utils/pluginConfig';

/**
 * Feature flag set whenever the runtime ConfigMap declares a
 * `developerPortalUrl`. Drives the conditional "Developer Portal"
 * sidebar item — when the URL is missing, the flag stays false and the
 * console hides the nav entry entirely.
 *
 * Registered as a `console.flag/hookProvider`: the SDK invokes this as
 * a React hook inside its FeatureFlag tree, so we can subscribe to the
 * underlying ConfigMap watch via `usePluginConfig` and re-emit when the
 * URL is added, removed, or edited at runtime — no Console reload
 * required.
 */
export const DEVELOPER_PORTAL_FLAG = 'DEVELOPER_PORTAL_URL_PRESENT';

export const useDeveloperPortalFlag = (setFlag: SetFeatureFlag): void => {
  const { config, loaded } = usePluginConfig();

  // Until the ConfigMap watch has at least returned once, leave the flag
  // unset rather than flapping false→true on first paint — the nav item
  // is also gated on the flag being explicitly true.
  const hasUrl = loaded && !!config.developerPortalUrl?.trim();

  React.useEffect(() => {
    setFlag(DEVELOPER_PORTAL_FLAG, hasUrl);
  }, [setFlag, hasUrl]);
};
