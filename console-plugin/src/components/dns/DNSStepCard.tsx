import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@patternfly/react-core';
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
 * Renders `text` inside a PatternFly Tooltip. Kept as a helper so
 * every card field that could overflow reads the same way. PF's
 * tooltip appears near the cursor (unlike the native `title` attribute
 * which shows after a ~2s delay in most browsers) and picks up the
 * plugin's theme automatically.
 */
const TruncatedText: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <Tooltip content={text} position="top">
    <span className={className}>{text}</span>
  </Tooltip>
);

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
        <div className="rhcl-dns-step-resource">
          <TruncatedText text={step.resourceName} />
        </div>
      )}
      {step.namespace && (
        <div className="rhcl-dns-step-namespace">
          <TruncatedText text={step.namespace} />
        </div>
      )}
      <p className="rhcl-dns-step-summary">{step.summary}</p>
      {step.details.length > 0 && (
        <dl className="rhcl-dns-step-details">
          {step.details.map((d) => (
            <React.Fragment key={d.label}>
              <dt>
                <TruncatedText text={d.label} />
              </dt>
              {/*
                Long values (ELB DNS names, hosted-zone IDs, hostnames)
                clip with CSS ellipsis; the PatternFly Tooltip surfaces
                the full string on hover so no info is lost, just
                visually tidied.
              */}
              <dd className={d.muted ? 'is-muted' : undefined}>
                <TruncatedText text={d.value} />
              </dd>
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
