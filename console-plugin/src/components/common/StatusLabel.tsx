import * as React from 'react';
import { Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { K8sCondition, StatusSeverity } from '../../types';
import { getWorstConditionSeverity, severityToLabelColor } from '../../utils/status';

interface StatusLabelProps {
  conditions?: K8sCondition[];
  severity?: StatusSeverity;
  label?: string;
}

const SEVERITY_ICONS: Record<StatusSeverity, React.ReactNode> = {
  healthy: <CheckCircleIcon />,
  warning: <ExclamationTriangleIcon />,
  critical: <ExclamationCircleIcon />,
  progressing: <InProgressIcon />,
  unknown: <UnknownIcon />,
};

const SEVERITY_LABELS: Record<StatusSeverity, string> = {
  healthy: 'Healthy',
  warning: 'Degraded',
  critical: 'Critical',
  progressing: 'Progressing',
  unknown: 'Unknown',
};

const StatusLabel: React.FC<StatusLabelProps> = ({ conditions, severity: severityOverride, label }) => {
  const severity = severityOverride ?? getWorstConditionSeverity(conditions);
  const displayLabel = label ?? SEVERITY_LABELS[severity];
  const color = severityToLabelColor(severity);

  return (
    <Label color={color} icon={SEVERITY_ICONS[severity]}>
      {displayLabel}
    </Label>
  );
};

export default StatusLabel;
