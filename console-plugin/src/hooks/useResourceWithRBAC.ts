import {
  useK8sWatchResource,
  useAccessReview,
  K8sGroupVersionKind,
  K8sResourceCommon,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

interface UseResourceWithRBACResult<T extends K8sResourceCommon> {
  data: T[];
  loaded: boolean;
  error: Error | undefined;
  hasAccess: boolean;
  accessLoading: boolean;
}

/**
 * Watch a list of a Gateway API / Kuadrant resource, paired with a
 * SelfSubjectAccessReview ("can this user list this resource?") used by the
 * page to decide between the "no resources found" and "you do not have
 * access" empty states.
 *
 * Source of truth for access is the SSAR (`useAccessReview`). The previous
 * implementation also forced `hasAccess = false` whenever the watch error
 * contained the strings "403" or "Forbidden". That broke the read-only
 * viewer flow: an SSAR-allowed user (confirmed via the API) was shown the
 * "you do not have access" empty state because a transient watch error
 * carried "Forbidden" in its message even though the user could list. The
 * official Kuadrant plugin renders the same gateways correctly, so the bug
 * is here and not in RBAC or the host Console.
 *
 * New behaviour:
 *   - `hasAccess` strictly mirrors the SSAR result.
 *   - `error` surfaces every watch error (the page can decide to render it
 *     alongside the data; we no longer silently swallow 403 responses).
 *   - Pages keep their "no resources found" / "you do not have access"
 *     branching by reading `hasAccess` and `data.length` independently.
 */
export function useResourceWithRBAC<T extends K8sResourceCommon>(
  gvk: K8sGroupVersionKind,
  namespace?: string,
): UseResourceWithRBACResult<T> {
  const watchResource: WatchK8sResource = {
    groupVersionKind: gvk,
    isList: true,
    ...(namespace ? { namespace } : {}),
  };

  const [data, loaded, watchError] = useK8sWatchResource<T[]>(watchResource);

  const [hasAccess, accessLoading] = useAccessReview({
    group: gvk.group,
    resource: kindToPlural(gvk.kind),
    verb: 'list',
    ...(namespace ? { namespace } : {}),
  });

  return {
    data: data || [],
    loaded: loaded && !accessLoading,
    error: watchError,
    hasAccess,
    accessLoading,
  };
}

/**
 * Naive Kind → plural conversion. Handles the irregular plurals we need
 * across Gateway API + Kuadrant + cert-manager kinds:
 *   - words ending in s/sh/ch/x/z take `-es` (GatewayClass → gatewayclasses)
 *   - words ending in consonant + y take `-ies` (AuthPolicy → authpolicies)
 *   - everything else takes `-s` (Gateway → gateways, HTTPRoute → httproutes)
 *
 * The previous version treated any trailing `s` as already-plural, which
 * mis-pluralised GatewayClass → "gatewayclass" and silently broke the SSAR
 * for that resource (the SDK requires the API-server-side plural).
 */
function kindToPlural(kind: string): string {
  const lower = kind.toLowerCase();
  if (/(s|sh|ch|x|z)$/.test(lower)) return lower + 'es';
  if (/[^aeiou]y$/.test(lower)) return lower.slice(0, -1) + 'ies';
  return lower + 's';
}
