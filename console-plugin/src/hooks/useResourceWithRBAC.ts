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

  const is403 = watchError?.message?.includes('403') || watchError?.message?.includes('Forbidden');

  return {
    data: data || [],
    loaded: loaded && !accessLoading,
    error: is403 ? undefined : watchError,
    hasAccess: is403 ? false : hasAccess,
    accessLoading,
  };
}

function kindToPlural(kind: string): string {
  const lower = kind.toLowerCase();
  if (lower.endsWith('s')) return lower;
  if (lower.endsWith('y')) return lower.slice(0, -1) + 'ies';
  return lower + 's';
}
