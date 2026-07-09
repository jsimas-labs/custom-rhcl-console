import * as React from 'react';
import {
  Alert,
  Content,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import {
  RATE_LIMIT_SCOPES,
  RateLimitScope,
} from '../../wizard/wizardTypes';

/**
 * Guided form for a RateLimitPolicy. Shares the scope catalogue with
 * the wizard so a policy created via the wizard reads back cleanly when
 * later edited via this form. See `wizardTypes.ts:RATE_LIMIT_SCOPES` for
 * the full option list and hints — and `manifests.ts:buildRateLimitLimits`
 * for how each scope translates to counters / when predicates on the CR.
 *
 * Same "parse yaml → render fields → serialise back" pattern as
 * AuthPolicyForm: the form doesn't own state, it derives everything
 * from the yaml prop and pushes changes up. See its file header for the
 * rationale.
 */

type TargetKind = 'Gateway' | 'HTTPRoute';

interface Rate {
  limit: number;
  window: string;
}

interface RateLimit {
  rates?: Rate[];
  counters?: Array<{ expression?: string }>;
  when?: Array<{ predicate?: string }>;
}
type LimitsMap = Record<string, RateLimit>;
interface RateLimitShape {
  apiVersion: string;
  kind: string;
  metadata?: { name?: string; namespace?: string };
  spec?: {
    targetRef?: { group?: string; kind?: string; name?: string };
    limits?: LimitsMap;
  };
}

interface FormValues {
  name: string;
  namespace: string;
  targetKind: TargetKind;
  targetName: string;
  limit: number;
  window: string;
  scope: RateLimitScope;
  scopeValue: string;
}

const WINDOW_OPTIONS: Array<{ v: string; l: string }> = [
  { v: '10s', l: '10 seconds' },
  { v: '1m', l: '1 minute' },
  { v: '1h', l: '1 hour' },
  { v: '1d', l: '1 day' },
];

/**
 * Reverse-engineer scope + scopeValue from an existing manifest. We look
 * at counters + when predicates in the first named limit. Unknown shapes
 * default to per-consumer — the operator can override in the dropdown.
 */
function detectScope(limits: LimitsMap | undefined):
  { scope: RateLimitScope; scopeValue: string } {
  if (!limits) return { scope: 'per-consumer', scopeValue: '' };
  const names = Object.keys(limits);
  // Per-plan is unambiguous: three named limits with plan-tier `when`
  // predicates. Detect by presence of `plan ==` in any when.
  const first = limits[names[0]];
  const anyWhen = names.some((n) => (limits[n].when || []).some((w) => (w.predicate || '').includes('auth.identity.plan')));
  if (anyWhen && names.length >= 2) return { scope: 'per-plan', scopeValue: '' };

  const counters = first?.counters || [];
  const whens = first?.when || [];
  const counterExpr = counters[0]?.expression || '';
  const whenPred = whens[0]?.predicate || '';

  if (counterExpr === 'auth.identity.userid') return { scope: 'per-consumer', scopeValue: '' };
  if (counterExpr === 'source.remote_address' && !whenPred) return { scope: 'per-ip', scopeValue: '' };
  if (counterExpr === 'source.remote_address' && whenPred.includes('startsWith')) {
    const m = whenPred.match(/startsWith\("([^"]+)"\)/);
    return { scope: 'per-ip-range', scopeValue: m ? `${m[1]}/32` : '' };
  }
  if (counterExpr.startsWith('request.headers.')) {
    return { scope: 'per-header', scopeValue: counterExpr.slice('request.headers.'.length) };
  }
  if (whenPred.includes('request.path.startsWith')) {
    const m = whenPred.match(/startsWith\("([^"]+)"\)/);
    return { scope: 'per-endpoint', scopeValue: m ? m[1] : '' };
  }
  if (counters.length === 0 && whens.length === 0) return { scope: 'global', scopeValue: '' };
  return { scope: 'per-consumer', scopeValue: '' };
}

function extractValues(obj: RateLimitShape | null): FormValues | null {
  if (!obj || typeof obj !== 'object' || obj.kind !== 'RateLimitPolicy') return null;
  const meta = obj.metadata || {};
  const spec = obj.spec || {};
  const target = spec.targetRef || {};
  const limits = spec.limits;
  const firstLimit = limits ? Object.values(limits)[0] : undefined;
  const firstRate = firstLimit?.rates?.[0];
  const { scope, scopeValue } = detectScope(limits);
  return {
    name: meta.name || '',
    namespace: meta.namespace || '',
    targetKind: (target.kind as TargetKind) === 'HTTPRoute' ? 'HTTPRoute' : 'Gateway',
    targetName: target.name || '',
    limit: firstRate?.limit ?? 100,
    window: firstRate?.window ?? '1m',
    scope,
    scopeValue,
  };
}

/** Same shape as manifests.ts:buildRateLimitLimits — kept locally so
 *  this form doesn't drag in wizard-only dependencies. */
function buildLimits(v: FormValues): Record<string, unknown> {
  const rates = [{ limit: v.limit, window: v.window }];
  switch (v.scope) {
    case 'per-consumer':
      return { default: { rates, counters: [{ expression: 'auth.identity.userid' }] } };
    case 'global':
      return { default: { rates } };
    case 'per-ip':
      return { default: { rates, counters: [{ expression: 'source.remote_address' }] } };
    case 'per-ip-range': {
      const cidr = v.scopeValue || '0.0.0.0/0';
      return {
        default: {
          rates,
          counters: [{ expression: 'source.remote_address' }],
          when: [{ predicate: `source.remote_address.split(":")[0].startsWith("${cidr.split('/')[0]}")` }],
        },
      };
    }
    case 'per-header': {
      const header = v.scopeValue || 'X-Tenant';
      return {
        default: {
          rates,
          counters: [{ expression: `request.headers.${header.toLowerCase()}` }],
        },
      };
    }
    case 'per-endpoint': {
      const path = v.scopeValue || '/';
      const key = `limit-${path.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'root'}`;
      return { [key]: { rates, when: [{ predicate: `request.path.startsWith("${path}")` }] } };
    }
    case 'per-plan':
      return {
        gold: { rates, when: [{ predicate: 'auth.identity.plan == "gold"' }] },
        silver: {
          rates: [{ limit: Math.max(1, Math.floor(v.limit / 2)), window: v.window }],
          when: [{ predicate: 'auth.identity.plan == "silver"' }],
        },
        bronze: {
          rates: [{ limit: Math.max(1, Math.floor(v.limit / 4)), window: v.window }],
          when: [{ predicate: 'auth.identity.plan == "bronze"' }],
        },
      };
  }
}

function toManifest(v: FormValues): RateLimitShape {
  return {
    apiVersion: 'kuadrant.io/v1',
    kind: 'RateLimitPolicy',
    metadata: { name: v.name, namespace: v.namespace },
    spec: {
      targetRef: {
        group: 'gateway.networking.k8s.io',
        kind: v.targetKind,
        name: v.targetName,
      },
      limits: buildLimits(v) as LimitsMap,
    },
  };
}

interface Props {
  yaml: string;
  onChange: (yaml: string) => void;
}

const RateLimitPolicyForm: React.FC<Props> = ({ yaml, onChange }) => {
  let parsed: RateLimitShape | null = null;
  let parseError: string | null = null;
  try {
    parsed = yamlLoad(yaml) as RateLimitShape;
  } catch (e) {
    parseError = (e as Error).message;
  }
  const values = extractValues(parsed);
  if (!values) {
    return (
      <div style={{ padding: 8 }}>
        <Alert variant="warning" isInline title="Cannot render form">
          {parseError
            ? `YAML failed to parse: ${parseError}.`
            : 'The YAML shape does not match RateLimitPolicy. Edit in the YAML tab.'}
        </Alert>
      </div>
    );
  }
  const update = (patch: Partial<FormValues>) => {
    const next = { ...values, ...patch };
    onChange(yamlDump(toManifest(next), { lineWidth: 0, noRefs: true, sortKeys: false }));
  };
  const scopeOpt = RATE_LIMIT_SCOPES.find((s) => s.id === values.scope);
  return (
    <div style={{ padding: 8, display: 'grid', gap: 12 }}>
      <FormGroup label="Name" isRequired>
        <TextInput value={values.name} onChange={(_e, v) => update({ name: v })} />
      </FormGroup>
      <FormGroup label="Namespace" isRequired>
        <TextInput value={values.namespace} onChange={(_e, v) => update({ namespace: v })} />
      </FormGroup>

      <Content>
        <h4 style={{ margin: '4px 0' }}>Target</h4>
      </Content>
      <FormGroup label="Kind">
        <FormSelect
          value={values.targetKind}
          onChange={(_e, v) => update({ targetKind: v as TargetKind })}
        >
          <FormSelectOption value="Gateway" label="Gateway" />
          <FormSelectOption value="HTTPRoute" label="HTTPRoute" />
        </FormSelect>
      </FormGroup>
      <FormGroup label={`${values.targetKind} name`} isRequired>
        <TextInput value={values.targetName} onChange={(_e, v) => update({ targetName: v })} />
      </FormGroup>

      <Content>
        <h4 style={{ margin: '4px 0' }}>Rate</h4>
      </Content>
      <FormGroup label="Limit (requests)">
        <TextInput
          type="number"
          value={values.limit}
          onChange={(_e, v) => update({ limit: Number(v) || 0 })}
        />
      </FormGroup>
      <FormGroup label="Window">
        <FormSelect value={values.window} onChange={(_e, v) => update({ window: v })}>
          {WINDOW_OPTIONS.map((o) => (
            <FormSelectOption key={o.v} value={o.v} label={o.l} />
          ))}
        </FormSelect>
      </FormGroup>

      <FormGroup label="Scope">
        <FormSelect
          value={values.scope}
          onChange={(_e, v) => update({ scope: v as RateLimitScope, scopeValue: '' })}
        >
          {RATE_LIMIT_SCOPES.map((s) => (
            <FormSelectOption key={s.id} value={s.id} label={s.label} />
          ))}
        </FormSelect>
        {scopeOpt?.hint && (
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--pf-v5-global--Color--200)' }}>
            {scopeOpt.hint}
          </div>
        )}
      </FormGroup>

      {scopeOpt?.needsValue && (
        <FormGroup
          label={
            scopeOpt.needsValue === 'cidr' ? 'CIDR' :
            scopeOpt.needsValue === 'header' ? 'Header name' : 'Path prefix'
          }
        >
          <TextInput
            value={values.scopeValue}
            onChange={(_e, v) => update({ scopeValue: v })}
            placeholder={
              scopeOpt.needsValue === 'cidr' ? '10.0.0.0/24' :
              scopeOpt.needsValue === 'header' ? 'X-Tenant' : '/api/v1/transfers'
            }
          />
        </FormGroup>
      )}
    </div>
  );
};

export default RateLimitPolicyForm;
