import * as React from 'react';
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  Modal,
  ModalVariant,
  Button,
  Alert,
  Content,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { k8sDelete, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import ResourceEditorModal from './ResourceEditorModal';

/**
 * Pluralize a Kind into its REST resource name the way the API server
 * does. The naïve `kind.toLowerCase() + 's'` breaks on every Kind
 * ending in a consonant + 'y' — `TLSPolicy` → `tlspolicys` (404),
 * when the real plural is `tlspolicies`. English rule: consonant + y →
 * ies; vowel + y (Gateway, Key) → +s; everything else → +s.
 */
function pluralizeKind(kind: string): string {
  const lower = kind.toLowerCase();
  if (/[^aeiou]y$/.test(lower)) return `${lower.slice(0, -1)}ies`;
  return `${lower}s`;
}

/**
 * Two-action menu (⋮ kebab) attached to any Kubernetes object the
 * plugin surfaces on a detail page:
 *
 *   - **Edit YAML** — links to the native Console YAML editor at
 *     `/k8s/ns/<ns>/<group>~<version>~<kind>/<name>/yaml`. Reuses the
 *     platform editor instead of shipping a Monaco instance inside
 *     the plugin — the Console team keeps that in shape for CRD
 *     schemas and dry-run validation, no reason to duplicate.
 *
 *   - **Delete** — pops a confirmation modal, then calls
 *     `k8sDelete` from the SDK. On success, navigates back to the
 *     resource's list page inside the plugin (`listHref`) so the
 *     operator lands on the collection they came from, not a 404
 *     on the now-gone detail page.
 *
 * The component is deliberately UI-only for these two flows —
 * anything richer (Create, Clone, Move, …) belongs on a dedicated
 * dropdown or its own affordance so we don't grow a "misc menu"
 * that hides discovery.
 */
export interface ResourceActionsMenuProps {
  /** The GVK the object belongs to. `group` is optional to match the
   * SDK's `K8sGroupVersionKind` (core resources like Pod/Service leave
   * it undefined). */
  gvk: { group?: string; version: string; kind: string };
  /** Object namespace (empty string for cluster-scoped kinds). */
  namespace: string;
  /** Object name. */
  name: string;
  /**
   * Path the plugin uses after a successful Delete. Points back to the
   * resource's list page so the operator isn't left staring at a 404
   * on a now-gone detail route.
   */
  listHref: string;
  /** Optional: override the display label for the resource in the
   * delete confirmation copy. Defaults to `{kind} {name}`. */
  displayName?: string;
  /**
   * When provided, the "Edit" menu item opens `ResourceEditorModal` in
   * edit mode with this resource pre-loaded. When absent, "Edit" falls
   * back to a link into Console's native YAML editor — same behaviour
   * we shipped originally, kept for callers that haven't been migrated
   * yet.
   *
   * We plumb the resource itself (not just a fetch trigger) because
   * the callers already have it in state — a second fetch just to fill
   * a modal would race their own watch and occasionally show stale
   * data.
   */
  resource?: K8sResourceCommon;
  /** Plural REST name (`httproutes`, `authpolicies`). Required only if
   *  `resource` is passed — the modal needs it for k8sUpdate. */
  plural?: string;
  /** Extra menu items rendered ABOVE the built-in Edit / Delete
   *  entries. Consumer's responsibility to render `<DropdownItem>` nodes
   *  (the component doesn't wrap them). Used by pages like Gateway
   *  detail to add a "Pods" quick-link without growing another
   *  standalone button next to the kebab. */
  topItems?: React.ReactNode;
}

const ResourceActionsMenu: React.FC<ResourceActionsMenuProps> = ({
  gvk,
  namespace,
  name,
  listHref,
  displayName,
  resource,
  plural,
  topItems,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Console's URL scheme: `/k8s/ns/<ns>/<group>~<version>~<kind>/<name>/yaml`
  // for namespaced kinds; `/k8s/cluster/<group>~<version>~<kind>/<name>/yaml`
  // for cluster-scoped. Empty group ("") is the core API — Console
  // renders it as `core~v1~<kind>`, so we normalise here.
  const groupToken = gvk.group || 'core';
  const yamlHref = namespace
    ? `/k8s/ns/${namespace}/${groupToken}~${gvk.version}~${gvk.kind}/${name}/yaml`
    : `/k8s/cluster/${groupToken}~${gvk.version}~${gvk.kind}/${name}/yaml`;

  const label = displayName || `${gvk.kind} ${name}`;

  const onDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      // Two things had this failing on policies:
      //
      //   1. K8sModel actually requires `abbr`, `label`, `labelPlural`,
      //      and `namespaced` on top of what we were passing. The SDK
      //      quietly derives the wrong REST URL when they're missing,
      //      which surfaced as an opaque 404 in the UI even though the
      //      DELETE hits the API server successfully via curl. Same
      //      shape the API-publishing wizard uses for k8sCreate — copy
      //      it here so Create/Edit/Delete all round-trip identically.
      //
      //   2. `plural` was always derived by `pluralizeKind(gvk.kind)`
      //      even when the caller passed a known-good plural via prop.
      //      Prefer the prop when it's set — same source of truth Edit
      //      reads from, so the two actions can never disagree on the
      //      target URL.
      const pluralName = plural || pluralizeKind(gvk.kind);
      await k8sDelete({
        model: {
          apiGroup: gvk.group,
          apiVersion: gvk.version,
          kind: gvk.kind,
          plural: pluralName,
          abbr: gvk.kind.slice(0, 3).toUpperCase(),
          label: gvk.kind,
          labelPlural: pluralName,
          namespaced: !!namespace,
        } as never,
        resource: {
          apiVersion: gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version,
          kind: gvk.kind,
          metadata: { name, namespace: namespace || undefined },
        },
      });
      setConfirming(false);
      history.push(listHref);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ResourceActionsMenu] delete failed', err);
      const e = err as { message?: string; json?: { message?: string }; body?: string };
      setError(e?.json?.message || e?.message || e?.body || String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dropdown
        isOpen={open}
        onOpenChange={setOpen}
        onSelect={() => setOpen(false)}
        popperProps={{ position: 'right' }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            aria-label={t('Actions')}
            variant="plain"
            onClick={() => setOpen((x) => !x)}
            isExpanded={open}
          >
            <EllipsisVIcon />
          </MenuToggle>
        )}
      >
        <DropdownList>
          {topItems}
          {resource && plural ? (
            <DropdownItem key="edit" onClick={() => setEditing(true)}>
              {t('Edit')}
            </DropdownItem>
          ) : (
            <DropdownItem key="edit-yaml" component="a" href={yamlHref}>
              {t('Edit YAML')}
            </DropdownItem>
          )}
          <DropdownItem
            key="delete"
            onClick={() => setConfirming(true)}
            className="pf-m-danger"
          >
            {t('Delete')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>

      {resource && plural && (
        <ResourceEditorModal
          isOpen={editing}
          mode="edit"
          gvk={gvk}
          plural={plural}
          namespaced={!!namespace}
          initialResource={resource}
          onClose={() => setEditing(false)}
        />
      )}

      <Modal
        variant={ModalVariant.small}
        title={t('Delete {{label}}?', { label })}
        isOpen={confirming}
        onClose={() => (deleting ? undefined : setConfirming(false))}
      >
        <Content>
          <p>
            {t('This will remove {{name}} from namespace {{ns}}. This cannot be undone.', {
              name,
              ns: namespace || t('(cluster-scoped)'),
            })}
          </p>
        </Content>
        {error && (
          <Alert
            variant="danger"
            title={t('Delete failed')}
            isInline
            style={{ marginTop: 12 }}
          >
            {error}
          </Alert>
        )}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            variant="link"
            onClick={() => setConfirming(false)}
            isDisabled={deleting}
          >
            {t('Cancel')}
          </Button>
          <Button variant="danger" onClick={onDelete} isLoading={deleting}>
            {t('Delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ResourceActionsMenu;
