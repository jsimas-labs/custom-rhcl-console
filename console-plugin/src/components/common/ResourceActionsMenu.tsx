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
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

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
   * Path Console uses to route the native YAML editor. Set to the
   * empty string for cluster-scoped kinds; the underlying URL then
   * drops the `/ns/<ns>` segment.
   */
  listHref: string;
  /** Optional: override the display label for the resource in the
   * delete confirmation copy. Defaults to `{kind} {name}`. */
  displayName?: string;
}

const ResourceActionsMenu: React.FC<ResourceActionsMenuProps> = ({
  gvk,
  namespace,
  name,
  listHref,
  displayName,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
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
      await k8sDelete({
        model: {
          apiGroup: gvk.group,
          apiVersion: gvk.version,
          kind: gvk.kind,
          plural: gvk.kind.toLowerCase() + 's', // fine for the resources we hit; SDK also accepts abbreviated
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
      setError((err as Error)?.message || String(err));
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
          <DropdownItem key="yaml" component="a" href={yamlHref}>
            {t('Edit YAML')}
          </DropdownItem>
          <DropdownItem
            key="delete"
            onClick={() => setConfirming(true)}
            className="pf-m-danger"
          >
            {t('Delete')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>

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
