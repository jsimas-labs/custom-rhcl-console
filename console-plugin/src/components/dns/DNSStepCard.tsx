import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  OutlinedQuestionCircleIcon,
  ArrowRightIcon,
} from '@patternfly/react-icons';
import { DnsStep, STATUS_META, StepStatus } from './types';

/**
 * One card in the horizontal DNS flow. Icons + colour come from
 * STATUS_META so a status change lights up everywhere at once. Cards
 * are sized fixed-width by the parent grid so the connectors always
 * line up regardless of content length.
 *
 * Click / keyboard-focus opens the card's `href` when one is set; the
 * details rows collapse behind an "Expand" toggle so an unexpanded
 * failure is still readable at a glance.
 */

const StatusIcon: React.FC<{ status: StepStatus; size?: number }> = ({ status, size = 14 }) => {
  const style: React.CSSProperties = { color: STATUS_META[status].color, fontSize: size };
  switch (STATUS_META[status].icon) {
    case 'check':
      return <CheckCircleIcon style={style} aria-hidden="true" />;
    case 'clock':
      return <ClockIcon style={style} aria-hidden="true" />;
    case 'exclamation':
      return <ExclamationTriangleIcon style={style} aria-hidden="true" />;
    case 'x':
      return <ExclamationCircleIcon style={style} aria-hidden="true" />;
    case 'minus':
      return <MinusCircleIcon style={style} aria-hidden="true" />;
    case 'question':
    default:
      return <OutlinedQuestionCircleIcon style={style} aria-hidden="true" />;
  }
};

interface Props {
  step: DnsStep;
  /** Zero-based index shown as a small label on top of the card. */
  index: number;
}

const DNSStepCard: React.FC<Props> = ({ step, index }) => {
  const meta = STATUS_META[step.status];
  return (
    <div
      className={`rhcl-dns-step is-${step.status}`}
      style={{ borderTopColor: meta.color }}
      data-step-id={step.id}
    >
      <div className="rhcl-dns-step-head">
        <span className="rhcl-dns-step-index">{index + 1}. {step.title}</span>
        <span className="rhcl-dns-step-badge" style={{ color: meta.color }}>
          <StatusIcon status={step.status} /> {meta.label}
        </span>
      </div>
      {step.resourceName && (
        <div className="rhcl-dns-step-resource" title={step.resourceName}>
          {step.resourceName}
        </div>
      )}
      {step.namespace && (
        <div className="rhcl-dns-step-namespace">{step.namespace}</div>
      )}
      <p className="rhcl-dns-step-summary">{step.summary}</p>
      {step.details.length > 0 && (
        <dl className="rhcl-dns-step-details">
          {step.details.map((d) => (
            <React.Fragment key={d.label}>
              <dt>{d.label}</dt>
              <dd className={d.muted ? 'is-muted' : undefined}>{d.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {step.href && (
        <div className="rhcl-dns-step-more">
          <Link to={step.href}>
            View details <ArrowRightIcon />
          </Link>
        </div>
      )}
    </div>
  );
};

export default DNSStepCard;
