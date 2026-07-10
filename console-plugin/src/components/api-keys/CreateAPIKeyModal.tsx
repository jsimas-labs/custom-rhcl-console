import * as React from 'react';
import {
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Alert,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import {
  useK8sWatchResource,
  k8sCreate,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { APIProductGVK } from '../../models';

/**
 * Modal that lets an operator create an APIKey CR without leaving the
 * cluster-wide list page. The CR carries the usual `spec.apiProductRef`
 * + `spec.planTier` + `spec.requestedBy` + `spec.useCase` fields the
 * Kuadrant devportal operator expects; the actual Secret is
 * provisioned by the controller on the normal APIKeyRequest →
 * APIKeyApproval path (auto-approved on APIProducts with
 * `approvalMode: automatic`, otherwise waits for an admin).
 *
 * When the operator just wants a smoke-test key for a fresh public
 * API, the Create API wizard's "Try it right away" toggle is still
 * the faster path — it emits a labeled Secret directly, bypassing
 * the APIKey CR entirely. This modal is the "proper" alternative for
 * per-consumer flows.
 */

interface APIProductResource extends K8sResourceCommon {
  spec?: {
    displayName?: string;
    approvalMode?: string;
  };
  status?: {
    discoveredPlans?: Array<{ tier?: string }>;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-select an APIProduct when opened from that product's page. */
  defaultProductNamespace?: string;
  defaultProductName?: string;
}

/** kebab-case the identifier so the k8s name is valid. */
function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CreateAPIKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultProductNamespace,
  defaultProductName,
}) => {
  const [products, productsLoaded] = useK8sWatchResource<APIProductResource[]>({
    groupVersionKind: APIProductGVK,
    isList: true,
  });

  const [productKey, setProductKey] = React.useState<string>(''); // "ns/name"
  const [plan, setPlan] = React.useState<string>('');
  const [userId, setUserId] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [useCase, setUseCase] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [productOpen, setProductOpen] = React.useState(false);
  const [planOpen, setPlanOpen] = React.useState(false);

  // Reset on open/close so a stale error from a previous submission
  // doesn't linger, and pre-seed the product picker when the caller
  // told us to.
  React.useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSubmitting(false);
    setProductOpen(false);
    setPlanOpen(false);
    if (defaultProductName && defaultProductNamespace) {
      setProductKey(`${defaultProductNamespace}/${defaultProductName}`);
    }
  }, [isOpen, defaultProductName, defaultProductNamespace]);

  const selectedProduct = React.useMemo(() => {
    if (!productKey) return null;
    const [ns, name] = productKey.split('/');
    return (products || []).find(
      (p) => p.metadata?.namespace === ns && p.metadata?.name === name,
    );
  }, [products, productKey]);

  // Auto-clear plan when the product changes so the picker doesn't
  // hold onto a plan that doesn't exist on the new product.
  React.useEffect(() => {
    setPlan('');
  }, [productKey]);

  const availablePlans = React.useMemo(() => {
    const plans = selectedProduct?.status?.discoveredPlans || [];
    const uniq = new Set<string>();
    for (const p of plans) if (p.tier) uniq.add(p.tier);
    return [...uniq];
  }, [selectedProduct]);

  // Derived APIKey name — `<product>-<userId>`. Keeps the naming that
  // the existing seed data uses (banking-api-alice) so admins recognise
  // the pattern immediately.
  const derivedName = React.useMemo(() => {
    if (!selectedProduct || !userId) return '';
    return `${selectedProduct.metadata?.name}-${slugify(userId)}`;
  }, [selectedProduct, userId]);

  const canSubmit = !!(selectedProduct && plan && userId && email);

  const submit = async () => {
    if (!canSubmit || !selectedProduct) return;
    setSubmitting(true);
    setError(null);
    const ns = selectedProduct.metadata?.namespace as string;
    const productName = selectedProduct.metadata?.name as string;
    const name = derivedName;
    try {
      await k8sCreate<K8sResourceCommon & { spec: unknown }>({
        // The plugin's models file uses the K8sModel shape — the
        // minimum k8sCreate needs is apiGroup/apiVersion/plural/kind
        // + namespaced.
        model: {
          apiGroup: 'devportal.kuadrant.io',
          apiVersion: 'v1alpha1',
          kind: 'APIKey',
          plural: 'apikeys',
          abbr: 'AK',
          label: 'APIKey',
          labelPlural: 'APIKeys',
          namespaced: true,
        },
        data: {
          apiVersion: 'devportal.kuadrant.io/v1alpha1',
          kind: 'APIKey',
          metadata: { name, namespace: ns },
          spec: {
            apiProductRef: { name: productName },
            planTier: plan,
            requestedBy: { userId, email },
            useCase: useCase || `Created via Console — ${userId}`,
          },
        },
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const approvalMode = selectedProduct?.spec?.approvalMode?.toLowerCase();

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Create API Key"
    >
      <ModalHeader title="Create API Key" />
      <ModalBody>
        {!productsLoaded ? (
          <Alert variant="info" isInline title="Loading API Products…" />
        ) : (products || []).length === 0 ? (
          <Alert variant="warning" isInline title="No API Products on the cluster">
            Create an API Product first — the wizard on the Overview page can do it
            in a couple of steps.
          </Alert>
        ) : (
          <Form>
            <FormGroup label="API Product" isRequired fieldId="ck-product">
              <Select
                aria-label="API Product"
                isOpen={productOpen}
                selected={productKey}
                onOpenChange={setProductOpen}
                onSelect={(_e, v) => {
                  setProductOpen(false);
                  setProductKey(v ? String(v) : '');
                }}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={ref}
                    onClick={() => setProductOpen((o) => !o)}
                    isExpanded={productOpen}
                    style={{ width: '100%' }}
                  >
                    {productKey || 'Select an API Product…'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {(products || []).map((p) => {
                    const key = `${p.metadata?.namespace}/${p.metadata?.name}`;
                    return (
                      <SelectOption key={key} value={key}>
                        <span>
                          <strong>{p.spec?.displayName || p.metadata?.name}</strong>
                          <span
                            style={{
                              color: 'var(--pf-v5-global--Color--200)',
                              marginLeft: 6,
                              fontSize: 12,
                            }}
                          >
                            {key}
                          </span>
                        </span>
                      </SelectOption>
                    );
                  })}
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup label="Plan" isRequired fieldId="ck-plan">
              {availablePlans.length === 0 ? (
                <Alert
                  variant="warning"
                  isInline
                  title="No plans discovered on this product"
                >
                  The APIProduct's status hasn't reported any plans yet. Attach a
                  PlanPolicy targeting the same HTTPRoute and it will appear here.
                </Alert>
              ) : (
                <Select
                  aria-label="Plan tier"
                  isOpen={planOpen}
                  selected={plan}
                  onOpenChange={setPlanOpen}
                  onSelect={(_e, v) => {
                    setPlanOpen(false);
                    setPlan(v ? String(v) : '');
                  }}
                  toggle={(ref: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={ref}
                      onClick={() => setPlanOpen((o) => !o)}
                      isExpanded={planOpen}
                      isDisabled={!selectedProduct}
                      style={{ width: '100%' }}
                    >
                      {plan || 'Select a plan…'}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {availablePlans.map((p) => (
                      <SelectOption key={p} value={p}>
                        {p}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              )}
            </FormGroup>

            <FormGroup label="Requester user ID" isRequired fieldId="ck-uid">
              <TextInput
                id="ck-uid"
                value={userId}
                onChange={(_e, v) => setUserId(v)}
                placeholder="alice"
              />
            </FormGroup>

            <FormGroup label="Requester email" isRequired fieldId="ck-email">
              <TextInput
                id="ck-email"
                type="email"
                value={email}
                onChange={(_e, v) => setEmail(v)}
                placeholder="alice@example.com"
              />
            </FormGroup>

            <FormGroup label="Use case" fieldId="ck-usecase">
              <TextArea
                id="ck-usecase"
                value={useCase}
                onChange={(_e, v) => setUseCase(v)}
                placeholder="What is this key for? (optional)"
                autoResize
              />
            </FormGroup>

            {derivedName && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--pf-v5-global--Color--200)',
                }}
              >
                APIKey CR will be named{' '}
                <code>{derivedName}</code> in <code>{selectedProduct?.metadata?.namespace}</code>.
                {approvalMode === 'automatic' && (
                  <div style={{ color: 'var(--pf-t--global--color--status--success--default)', marginTop: 4 }}>
                    This product auto-approves new keys — the Secret will be
                    provisioned within seconds.
                  </div>
                )}
                {approvalMode !== 'automatic' && (
                  <div style={{ marginTop: 4 }}>
                    The key starts in <strong>Pending</strong> — an admin must
                    approve it before Kuadrant provisions the Secret.
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="danger" isInline title="Failed to create APIKey">
                {error}
              </Alert>
            )}
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={submit}
          isDisabled={!canSubmit || submitting}
          isLoading={submitting}
        >
          Create
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={submitting}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateAPIKeyModal;
