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
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  Alert,
  Grid,
  GridItem,
  Divider,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  k8sCreate,
  k8sUpdate,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { PluginConfig, parseCostPricing } from '../../utils/pluginConfig';

/**
 * Edit the plugin's runtime ConfigMap without leaving the Console.
 *
 * The plugin is a browser-side federated module, so this ConfigMap is its
 * only runtime config channel — and until now the only way to change it was
 * `oc edit configmap` (or the ConfigMap YAML editor), which means hand-writing
 * the `costPricing` JSON blob correctly. This form owns that shape instead:
 * pricing is edited as a tier table and serialised on save, so a typo can't
 * silently disable the monetary column.
 *
 * Empty fields are OMITTED from `data` rather than written as "" — the plugin
 * treats a missing key as "use my built-in default", and an empty URL as
 * "hide that sidebar item". Writing "" would be indistinguishable from the
 * former while behaving like the latter.
 */

const CONFIGMAP_MODEL = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  plural: 'configmaps',
  abbr: 'CM',
  label: 'ConfigMap',
  labelPlural: 'ConfigMaps',
  namespaced: true,
};

interface ConfigMapResource extends K8sResourceCommon {
  data?: Record<string, string>;
}

interface PricingRow {
  /** Local-only key so React can track rows while the tier name is edited. */
  id: number;
  tier: string;
  tokens: string;
  calls: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: PluginConfig;
  /** The live ConfigMap, when it exists — supplies resourceVersion for update. */
  cm?: ConfigMapResource;
  namespace: string;
  name: string;
}

/** Text field bound to a plain string state slot. */
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  type?: 'text' | 'number';
  invalid?: string;
}> = ({ label, value, onChange, placeholder, helper, type = 'text', invalid }) => (
  <FormGroup label={label} fieldId={label}>
    <TextInput
      id={label}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(_e, v) => onChange(v)}
      validated={invalid ? 'error' : 'default'}
    />
    {(helper || invalid) && (
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant={invalid ? 'error' : 'default'}>{invalid || helper}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    )}
  </FormGroup>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Title headingLevel="h3" size="md" style={{ marginBottom: 4 }}>
    {children}
  </Title>
);

const SettingsEditModal: React.FC<Props> = ({ isOpen, onClose, config, cm, namespace, name }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [developerPortalUrl, setDeveloperPortalUrl] = React.useState('');
  const [internalDeveloperHubUrl, setInternalDeveloperHubUrl] = React.useState('');
  const [dnsProberUrl, setDnsProberUrl] = React.useState('');
  const [grafanaNamespace, setGrafanaNamespace] = React.useState('');
  const [grafanaRouteName, setGrafanaRouteName] = React.useState('');
  const [grafanaDashboardPrefix, setGrafanaDashboardPrefix] = React.useState('');
  const [tempoNamespace, setTempoNamespace] = React.useState('');
  const [tempoGatewayRouteName, setTempoGatewayRouteName] = React.useState('');
  const [tempoStackName, setTempoStackName] = React.useState('');
  const [costCurrency, setCostCurrency] = React.useState('');
  const [costBudget, setCostBudget] = React.useState('');
  const [pricingRows, setPricingRows] = React.useState<PricingRow[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Read the freshest config at open time without making it an effect dep:
  // `usePluginConfig` returns `cm?.data || {}`, a NEW object identity on every
  // watch emission, so depending on it would re-seed the form (wiping what the
  // user is typing) any time anything touched the ConfigMap.
  const configRef = React.useRef(config);
  configRef.current = config;

  // Seed on the closed→open transition only: a cancelled edit must not leak
  // into the next open, and reopening should show current cluster values.
  React.useEffect(() => {
    if (!isOpen) return;
    const config = configRef.current;
    setDeveloperPortalUrl(config.developerPortalUrl || '');
    setInternalDeveloperHubUrl(config.internalDeveloperHubUrl || '');
    setDnsProberUrl(config.dnsProberUrl || '');
    setGrafanaNamespace(config.grafanaNamespace || '');
    setGrafanaRouteName(config.grafanaRouteName || '');
    setGrafanaDashboardPrefix(config.grafanaDashboardPrefix || '');
    setTempoNamespace(config.tempoNamespace || '');
    setTempoGatewayRouteName(config.tempoGatewayRouteName || '');
    setTempoStackName(config.tempoStackName || '');
    setCostCurrency(config.costCurrency || '');
    setCostBudget(config.costBudget != null ? String(config.costBudget) : '');
    const parsed = parseCostPricing(config.costPricing);
    setPricingRows(
      Object.entries(parsed)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tier, v], i) => ({
          id: i,
          tier,
          tokens: String(v.tokens_per_1k),
          calls: String(v.calls_per_1k),
        })),
    );
    setError(null);
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateRow = (id: number, patch: Partial<PricingRow>) =>
    setPricingRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: number) => setPricingRows((rows) => rows.filter((r) => r.id !== id));
  const addRow = () =>
    setPricingRows((rows) => [
      ...rows,
      { id: rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 0, tier: '', tokens: '0', calls: '0' },
    ]);

  // --- Validation -----------------------------------------------------------
  const budgetInvalid =
    costBudget.trim() !== '' && !Number.isFinite(Number(costBudget))
      ? t('Must be a number.')
      : undefined;

  const pricingErrors = React.useMemo(() => {
    const errs: string[] = [];
    const seen = new Set<string>();
    pricingRows.forEach((r) => {
      const tier = r.tier.trim().toLowerCase();
      if (!tier) {
        errs.push(t('Every pricing row needs a tier name.'));
        return;
      }
      if (seen.has(tier)) errs.push(t('Duplicate tier "{{tier}}".', { tier }));
      seen.add(tier);
      if (!Number.isFinite(Number(r.tokens)) || !Number.isFinite(Number(r.calls))) {
        errs.push(t('Rates for "{{tier}}" must be numbers.', { tier }));
      }
    });
    return Array.from(new Set(errs));
  }, [pricingRows, t]);

  const invalid = Boolean(budgetInvalid) || pricingErrors.length > 0;

  // --- Save -----------------------------------------------------------------
  const onSave = async () => {
    setSaving(true);
    setError(null);

    // Only non-empty values are written: the plugin reads a missing key as
    // "fall back to my default", which is what clearing a field should mean.
    const data: Record<string, string> = {};
    const put = (key: string, value: string) => {
      if (value.trim()) data[key] = value.trim();
    };
    put('developerPortalUrl', developerPortalUrl);
    put('internalDeveloperHubUrl', internalDeveloperHubUrl);
    put('dnsProberUrl', dnsProberUrl);
    put('grafanaNamespace', grafanaNamespace);
    put('grafanaRouteName', grafanaRouteName);
    put('grafanaDashboardPrefix', grafanaDashboardPrefix);
    put('tempoNamespace', tempoNamespace);
    put('tempoGatewayRouteName', tempoGatewayRouteName);
    put('tempoStackName', tempoStackName);
    put('costCurrency', costCurrency);
    put('costBudget', costBudget);

    const pricing: Record<string, { tokens_per_1k: number; calls_per_1k: number }> = {};
    pricingRows.forEach((r) => {
      const tier = r.tier.trim().toLowerCase();
      if (!tier) return;
      pricing[tier] = { tokens_per_1k: Number(r.tokens), calls_per_1k: Number(r.calls) };
    });
    if (Object.keys(pricing).length > 0) data.costPricing = JSON.stringify(pricing);

    try {
      if (cm?.metadata?.name) {
        await k8sUpdate<ConfigMapResource>({
          model: CONFIGMAP_MODEL,
          data: { ...cm, data },
        });
      } else {
        await k8sCreate<ConfigMapResource>({
          model: CONFIGMAP_MODEL,
          data: {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: { name, namespace, labels: { 'app.kubernetes.io/part-of': 'rhcl-custom-console' } },
            data,
          },
        });
      }
      onClose();
    } catch (e) {
      const msg = (e as { message?: string })?.message || String(e);
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <Modal variant={ModalVariant.large} isOpen={isOpen} onClose={onClose} aria-label={t('Edit plugin configuration')}>
      <ModalHeader title={t('Edit plugin configuration')} />
      <ModalBody>
        <Alert
          variant="info"
          isInline
          isPlain
          title={t('Stored in the plugin ConfigMap')}
          style={{ marginBottom: 16 }}
        >
          {t('These values are saved to the ConfigMap')}{' '}
          <code>{name}</code> {t('in namespace')} <code>{namespace}</code>.{' '}
          {t('The plugin watches it live, so saving takes effect on the next Console reload — no redeploy needed.')}
        </Alert>

        {error && (
          <Alert variant="danger" isInline title={t('Could not save')} style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}

        <Form>
          <SectionTitle>{t('Links')}</SectionTitle>
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                {t('Absolute URLs the sidebar opens. Leave empty to hide that item.')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
          <Grid hasGutter>
            <GridItem md={6} span={12}>
              <Field
                label={t('Developer Portal URL')}
                value={developerPortalUrl}
                onChange={setDeveloperPortalUrl}
                placeholder="https://devportal.apps.example.com"
              />
            </GridItem>
            <GridItem md={6} span={12}>
              <Field
                label={t('Internal Developer Hub URL')}
                value={internalDeveloperHubUrl}
                onChange={setInternalDeveloperHubUrl}
                placeholder="https://rhdh.apps.example.com"
              />
            </GridItem>
            <GridItem md={6} span={12}>
              <Field
                label={t('DNS Prober URL')}
                value={dnsProberUrl}
                onChange={setDnsProberUrl}
                placeholder="https://dns-prober.apps.example.com"
                helper={t('Enables live cross-resolver data on the DNS page.')}
              />
            </GridItem>
          </Grid>

          <Divider style={{ margin: '8px 0' }} />
          <SectionTitle>{t('Observability')}</SectionTitle>
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                {t('Where the Grafana dashboards and the Tempo instance live. Empty uses the in-cluster defaults.')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
          <Grid hasGutter>
            <GridItem md={4} span={12}>
              <Field label={t('Grafana namespace')} value={grafanaNamespace} onChange={setGrafanaNamespace} placeholder="monitoring" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field label={t('Grafana route name')} value={grafanaRouteName} onChange={setGrafanaRouteName} placeholder="grafana" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field label={t('Dashboard UID prefix')} value={grafanaDashboardPrefix} onChange={setGrafanaDashboardPrefix} placeholder="rhcl-" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field label={t('Tempo namespace')} value={tempoNamespace} onChange={setTempoNamespace} placeholder="tempo" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field label={t('Tempo gateway route')} value={tempoGatewayRouteName} onChange={setTempoGatewayRouteName} placeholder="tempo-tempo-rhcl-gateway" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field label={t('TempoStack name')} value={tempoStackName} onChange={setTempoStackName} placeholder="tempo-rhcl" />
            </GridItem>
          </Grid>

          <Divider style={{ margin: '8px 0' }} />
          <SectionTitle>{t('Cost Monitoring')}</SectionTitle>
          <Grid hasGutter>
            <GridItem md={4} span={12}>
              <Field label={t('Currency')} value={costCurrency} onChange={setCostCurrency} placeholder="BRL" />
            </GridItem>
            <GridItem md={4} span={12}>
              <Field
                label={t('Monthly budget')}
                value={costBudget}
                onChange={setCostBudget}
                placeholder="10000"
                invalid={budgetInvalid}
                helper={t('Drives the Budget Usage KPI. Empty hides the card.')}
              />
            </GridItem>
          </Grid>

          <FormGroup label={t('Pricing per tier')} fieldId="pricing">
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  {t('cost = (calls ÷ 1000) × per-1K-calls + (tokens ÷ 1000) × per-1K-tokens, charged at each consumer’s tier rate. Tier names must match the secret.kuadrant.io/plan-id annotation on the APIKey Secrets. No rows ⇒ the pages show raw usage only.')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
            <Table aria-label={t('Pricing per tier')} variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Tier')}</Th>
                  <Th>{t('Per 1K calls')}</Th>
                  <Th>{t('Per 1K tokens')}</Th>
                  <Th screenReaderText={t('Actions')} />
                </Tr>
              </Thead>
              <Tbody>
                {pricingRows.length === 0 ? (
                  <Tr>
                    <Td colSpan={4}>{t('No pricing configured — usage will be shown without monetary values.')}</Td>
                  </Tr>
                ) : (
                  pricingRows.map((r) => (
                    <Tr key={r.id}>
                      <Td>
                        <TextInput
                          aria-label={t('Tier')}
                          value={r.tier}
                          placeholder="gold"
                          onChange={(_e, v) => updateRow(r.id, { tier: v })}
                        />
                      </Td>
                      <Td>
                        <TextInput
                          aria-label={t('Per 1K calls')}
                          value={r.calls}
                          onChange={(_e, v) => updateRow(r.id, { calls: v })}
                        />
                      </Td>
                      <Td>
                        <TextInput
                          aria-label={t('Per 1K tokens')}
                          value={r.tokens}
                          onChange={(_e, v) => updateRow(r.id, { tokens: v })}
                        />
                      </Td>
                      <Td>
                        <Button
                          variant="plain"
                          aria-label={t('Remove tier')}
                          onClick={() => removeRow(r.id)}
                          icon={<TrashIcon />}
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
            <Button variant="link" isInline icon={<PlusCircleIcon />} onClick={addRow} style={{ marginTop: 8 }}>
              {t('Add tier')}
            </Button>
            {pricingErrors.length > 0 && (
              <Alert variant="danger" isInline isPlain title={t('Fix the pricing table')} style={{ marginTop: 8 }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                  {pricingErrors.map((e) => (
                    <FlexItem key={e}>{e}</FlexItem>
                  ))}
                </Flex>
              </Alert>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onSave} isDisabled={invalid || saving} isLoading={saving}>
          {saving ? t('Saving…') : t('Save')}
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={saving}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SettingsEditModal;
