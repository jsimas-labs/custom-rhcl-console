import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleAction,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ResourceEditorModal from './ResourceEditorModal';
import {
  SupportedKind,
  starterFor,
} from './starterTemplates';
import {
  GatewayGVK,
  HTTPRouteGVK,
  GRPCRouteGVK,
  AuthPolicyGVK,
  RateLimitPolicyGVK,
  TokenRateLimitPolicyGVK,
  DNSPolicyGVK,
  TLSPolicyGVK,
} from '../../models';

/**
 * The single "Create" affordance for every list page. Deliberately
 * shape-shifting:
 *
 *   - **One Kind** → renders as a primary Button. This is the common
 *     case (Gateway list → "Create Gateway").
 *   - **Multiple Kinds** → renders as a split dropdown ("Create policy
 *     ▾" on the aggregated Policies page, one item per Kind). Cheaper
 *     than five buttons and honest about the choice the operator has
 *     to make anyway.
 *
 * Both shapes open the same `ResourceEditorModal`. The starter YAML is
 * seeded from `starterTemplates.ts` — one source of truth for what a
 * freshly-created resource looks like.
 */

interface KindDescriptor {
  kind: SupportedKind;
  gvk: { group?: string; version: string; kind: string };
  plural: string;
}

const KIND_TABLE: Record<SupportedKind, KindDescriptor> = {
  Gateway: { kind: 'Gateway', gvk: GatewayGVK, plural: 'gateways' },
  HTTPRoute: { kind: 'HTTPRoute', gvk: HTTPRouteGVK, plural: 'httproutes' },
  GRPCRoute: { kind: 'GRPCRoute', gvk: GRPCRouteGVK, plural: 'grpcroutes' },
  AuthPolicy: { kind: 'AuthPolicy', gvk: AuthPolicyGVK, plural: 'authpolicies' },
  RateLimitPolicy: {
    kind: 'RateLimitPolicy',
    gvk: RateLimitPolicyGVK,
    plural: 'ratelimitpolicies',
  },
  TokenRateLimitPolicy: {
    kind: 'TokenRateLimitPolicy',
    gvk: TokenRateLimitPolicyGVK,
    plural: 'tokenratelimitpolicies',
  },
  DNSPolicy: { kind: 'DNSPolicy', gvk: DNSPolicyGVK, plural: 'dnspolicies' },
  TLSPolicy: { kind: 'TLSPolicy', gvk: TLSPolicyGVK, plural: 'tlspolicies' },
};

export interface CreateResourceMenuProps {
  /** One or more Kinds this menu can create. When length is 1 the
   *  component collapses into a single primary button. */
  kinds: SupportedKind[];
  /** Namespace to seed into the starter YAML. Callers usually pass the
   *  currently-selected namespace filter so a fresh Create lands where
   *  the operator was looking. */
  defaultNamespace?: string;
  /** Label overrides — useful when a page's language ("New API")
   *  reads better than the auto "Create <Kind>". */
  buttonLabel?: string;
}

const CreateResourceMenu: React.FC<CreateResourceMenuProps> = ({
  kinds,
  defaultNamespace,
  buttonLabel,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const location = useLocation();
  const [openKind, setOpenKind] = React.useState<SupportedKind | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const openCreate = (kind: SupportedKind) => setOpenKind(kind);
  const close = () => setOpenKind(null);

  const seed = openKind
    ? starterFor(openKind, defaultNamespace || 'rhcl-apps')
    : null;
  const descriptor = openKind ? KIND_TABLE[openKind] : null;

  const modal =
    openKind && descriptor && seed ? (
      <ResourceEditorModal
        isOpen
        mode="create"
        gvk={descriptor.gvk}
        plural={descriptor.plural}
        starterYaml={seed.yaml}
        hint={seed.template.hint}
        // Stay on the list page after Create — the resource shows up in
        // the table via the ongoing watch. Detail navigation would hide
        // the new row from the operator who just made it.
        redirectTo={location.pathname}
        onClose={close}
      />
    ) : null;

  if (kinds.length === 1) {
    const only = kinds[0];
    return (
      <>
        <Button variant="primary" onClick={() => openCreate(only)}>
          {buttonLabel || t('Create {{kind}}', { kind: only })}
        </Button>
        {modal}
      </>
    );
  }

  return (
    <>
      <Dropdown
        isOpen={dropdownOpen}
        onOpenChange={setDropdownOpen}
        onSelect={() => setDropdownOpen(false)}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            variant="primary"
            onClick={() => setDropdownOpen((x) => !x)}
            isExpanded={dropdownOpen}
            splitButtonItems={[
              <MenuToggleAction
                key="label"
                aria-label={buttonLabel || t('Create')}
                onClick={() => openCreate(kinds[0])}
              >
                {buttonLabel || t('Create')}
              </MenuToggleAction>,
            ]}
          />
        )}
      >
        <DropdownList>
          {kinds.map((k) => (
            <DropdownItem key={k} onClick={() => openCreate(k)}>
              {t('Create {{kind}}', { kind: k })}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
      {modal}
    </>
  );
};

export default CreateResourceMenu;
