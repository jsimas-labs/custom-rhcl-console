import * as React from 'react';
import { ExpandableSection, Progress, ProgressSize, Tooltip } from '@patternfly/react-core';
import { CheckCircleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { dump } from 'js-yaml';
import { WizardState, READINESS, readinessPct } from './wizardTypes';
import { generateAll } from './manifests';

/**
 * Live architecture diagram — a vertical chain of labelled boxes with
 * arrows. Pure CSS/flexbox; nodes light up as their part of the state
 * is filled so the user sees the picture assemble while they answer.
 */
export const ArchDiagram: React.FC<{ state: WizardState }> = ({ state }) => {
  const nodes: { label: string; sub?: string; active: boolean }[] = [
    { label: 'Internet', active: true },
    {
      label: 'Gateway',
      sub: state.useExistingGateway
        ? state.existingGatewayName || undefined
        : state.gatewayName || undefined,
      active: state.useExistingGateway ? !!state.existingGatewayName : !!state.gatewayName,
    },
    {
      label: 'Routes',
      sub: state.routes.length > 0 ? `${state.routes.length} rule(s)` : undefined,
      active: state.routes.length > 0 && state.routes.every((r) => !!r.path),
    },
    {
      label: 'Policies',
      sub:
        [
          state.authMode !== 'anonymous' ? 'auth' : null,
          state.rateLimitEnabled ? 'rate-limit' : null,
          state.tokenLimitEnabled ? 'token-limit' : null,
          state.dnsEnabled ? 'dns' : null,
          state.tlsPolicyEnabled ? 'tls' : null,
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
      active: state.authMode !== 'anonymous' || state.rateLimitEnabled || state.tlsPolicyEnabled,
    },
    {
      label: 'Backend',
      // Multi-backend surfaces as either "1 backend" (with the
      // resolved ns/name:port on hover) or "N backends" — the split
      // preview stays in the actual BackendStep to avoid crowding the
      // right-column diagram.
      sub: (() => {
        const bs = state.backends;
        if (bs.length === 0) return undefined;
        if (bs.length === 1) {
          const b = bs[0];
          return `${b.namespace}/${b.name}:${b.port ?? ''}`;
        }
        return `${bs.length} backends`;
      })(),
      active: state.backends.length > 0,
    },
  ];
  return (
    <div className="rhcl-wiz-diagram" aria-hidden="true">
      {nodes.map((n, i) => (
        <React.Fragment key={n.label}>
          {i > 0 && <div className="rhcl-wiz-diagram-arrow">↓</div>}
          <div className={`rhcl-wiz-diagram-node${n.active ? ' rhcl-wiz-diagram-node--active' : ''}`}>
            <div className="rhcl-wiz-diagram-label">{n.label}</div>
            {n.sub && <div className="rhcl-wiz-diagram-sub">{n.sub}</div>}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Persistent right sidebar: API readiness + generated resources.
 * The manifests expand inline (educational: the user sees exactly
 * what Kuadrant objects their answers turn into).
 */
export const ResourceSidebar: React.FC<{ state: WizardState }> = ({ state }) => {
  const resources = generateAll(state);
  const pct = readinessPct(state);
  const applicable = READINESS.filter((r) => !r.applicable || r.applicable(state));
  return (
    <div className="rhcl-wiz-sidebar">
      <div className="rhcl-wiz-sidebar-section">
        <div className="rhcl-wiz-sidebar-title">
          API Readiness
          <Tooltip content="Requirements resolved from your answers. Missing items stay grey until the related step is filled.">
            <InfoCircleIcon style={{ marginLeft: 6, opacity: 0.6, fontSize: 13 }} />
          </Tooltip>
        </div>
        <div className="rhcl-wiz-readiness-pct">{pct}%</div>
        <Progress value={pct} size={ProgressSize.sm} aria-label="API readiness" measureLocation="none" />
        <ul className="rhcl-wiz-readiness-list">
          {applicable.map((r) => {
            const ok = r.done(state);
            return (
              <li key={r.key} className={ok ? 'is-done' : ''}>
                <CheckCircleIcon
                  style={{
                    color: ok
                      ? 'var(--pf-t--global--color--status--success--default)'
                      : 'var(--pf-t--global--border--color--default)',
                    fontSize: 13,
                  }}
                />
                {r.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rhcl-wiz-sidebar-section">
        <div className="rhcl-wiz-sidebar-title">Generated Resources ({resources.length})</div>
        {resources.length === 0 ? (
          <div className="rhcl-wiz-sidebar-empty">Answer the steps to see the manifests build up here.</div>
        ) : (
          resources.map((r) => (
            <ExpandableSection
              key={`${r.kind}/${r.name}`}
              toggleContent={
                <span className="rhcl-wiz-resource-toggle">
                  <CheckCircleIcon
                    style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: 12 }}
                  />{' '}
                  {r.kind} <span className="rhcl-wiz-resource-name">{r.name}</span>
                </span>
              }
            >
              <pre className="rhcl-wiz-yaml">{dump(r.manifest, { noRefs: true })}</pre>
            </ExpandableSection>
          ))
        )}
      </div>
    </div>
  );
};

/** Step header — every step answers What / Why / What happens. */
export const StepHeader: React.FC<{
  title: string;
  what: string;
}> = ({ title, what }) => (
  <div className="rhcl-wiz-step-header">
    <h2>{title}</h2>
    <p>{what}</p>
  </div>
);

/** Simple labelled field wrapper (PF FormGroup is heavier than needed). */
export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="rhcl-wiz-field">
    <label>{label}</label>
    {children}
    {hint && <div className="rhcl-wiz-field-hint">{hint}</div>}
  </div>
);
