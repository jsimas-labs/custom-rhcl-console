import {
  K8sGroupVersionKind,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * Gateway API policy discoverability label. Per GEP-713 ("Metaresources and
 * Policy Attachment"), CRDs that represent attachable policies are labeled
 * with this key and a value of either `"inherited"` or `"direct"`. Tools that
 * want to enumerate every policy type at runtime (rather than hard-coding a
 * list of known kinds) MUST filter CRDs on this label.
 */
export const GATEWAY_POLICY_LABEL_KEY = 'gateway.networking.k8s.io/policy';
export const GATEWAY_POLICY_LABEL_VALUES = ['inherited', 'direct'] as const;

const CRD_GVK: K8sGroupVersionKind = {
  group: 'apiextensions.k8s.io',
  version: 'v1',
  kind: 'CustomResourceDefinition',
};

// Minimal view over CustomResourceDefinition — only the fields the discovery
// hook needs, so we do not have to pull in the full apiextensions types.
interface CRDVersion {
  name: string;
  served?: boolean;
  storage?: boolean;
}

interface CRDLike extends K8sResourceCommon {
  spec?: {
    group?: string;
    scope?: 'Namespaced' | 'Cluster';
    names?: {
      kind?: string;
      plural?: string;
      singular?: string;
    };
    versions?: CRDVersion[];
  };
}

/**
 * A policy CRD discovered at runtime.
 *
 * Use this to drive dynamic policy watches: any consumer that wants to list
 * "all policies attached to X" should enumerate `DiscoveredPolicyCRD[]` and
 * watch each `gvk` rather than referring to a static GVK constant.
 */
export interface DiscoveredPolicyCRD {
  /** GVK suitable for `useK8sWatchResource` (the storage version, falling back to the first served version). */
  gvk: K8sGroupVersionKind;
  /** Cluster vs Namespaced — drives whether the watch needs a namespace. */
  scope: 'Namespaced' | 'Cluster';
  /** Kind name (also exposed via gvk.kind for convenience). */
  kind: string;
  /** API group of the policy CRD (also exposed via gvk.group). */
  group: string;
  /** Plural form, when present — useful for building REST URLs. */
  plural?: string;
  /** GEP-713 label value ("inherited" | "direct"). */
  attachmentType: 'inherited' | 'direct';
}

interface UseDiscoveredPolicyCRDsResult {
  crds: DiscoveredPolicyCRD[];
  loaded: boolean;
  error: Error | undefined;
}

/**
 * Pick the version a client should watch for a given CRD:
 *   1. the one flagged as `storage: true` and `served: true` (canonical), or
 *   2. the first `served: true` version, or
 *   3. the first version in the list.
 *
 * Returns `undefined` if the CRD declares no versions, in which case the
 * caller MUST drop it from the result set rather than fabricating a GVK.
 */
function pickVersion(versions: CRDVersion[] | undefined): string | undefined {
  if (!Array.isArray(versions) || versions.length === 0) return undefined;
  const storage = versions.find((v) => v.served && v.storage);
  if (storage) return storage.name;
  const served = versions.find((v) => v.served);
  if (served) return served.name;
  return versions[0].name;
}

/**
 * Convert a CRD object into a `DiscoveredPolicyCRD` row, or return undefined
 * when the CRD is missing data the discovery view needs (group / kind /
 * version / valid GEP-713 attachment-type label).
 */
function toDiscoveredCRD(crd: CRDLike): DiscoveredPolicyCRD | undefined {
  const spec = crd.spec || {};
  const group = spec.group;
  const kind = spec.names?.kind;
  const version = pickVersion(spec.versions);
  const label = crd.metadata?.labels?.[GATEWAY_POLICY_LABEL_KEY];
  const attachment = label === 'inherited' || label === 'direct' ? label : undefined;

  if (!group || !kind || !version || !attachment) return undefined;

  return {
    gvk: { group, version, kind },
    scope: spec.scope === 'Cluster' ? 'Cluster' : 'Namespaced',
    group,
    kind,
    plural: spec.names?.plural,
    attachmentType: attachment,
  };
}

/**
 * Discover every Gateway API policy CRD installed on the cluster.
 *
 * Watches `CustomResourceDefinition`s filtered server-side by the GEP-713
 * label and projects each into a `DiscoveredPolicyCRD`. The output is a
 * stable, sorted list (by kind) so React renders that iterate it produce
 * deterministic hook order.
 *
 * This hook is the data-layer entry point for FR-003 / §12 Q8 (policy
 * discoverability). Wiring the discovered set into the live policy watches
 * is the next step and happens in a follow-up commit.
 */
export function useDiscoveredPolicyCRDs(): UseDiscoveredPolicyCRDsResult {
  const [crds, loaded, error] = useK8sWatchResource<CRDLike[]>({
    groupVersionKind: CRD_GVK,
    isList: true,
    // Server-side filter via labelSelector matchExpressions: include CRDs whose
    // GEP-713 label is either "inherited" or "direct". Falls back to a
    // client-side filter inside toDiscoveredCRD when the API server ignores
    // the selector for some reason.
    selector: {
      matchExpressions: [
        {
          key: GATEWAY_POLICY_LABEL_KEY,
          operator: 'In',
          values: [...GATEWAY_POLICY_LABEL_VALUES],
        },
      ],
    },
  });

  const result: DiscoveredPolicyCRD[] = [];
  for (const crd of crds || []) {
    const row = toDiscoveredCRD(crd);
    if (row) result.push(row);
  }
  result.sort((a, b) => a.kind.localeCompare(b.kind));

  return { crds: result, loaded, error: error as Error | undefined };
}
