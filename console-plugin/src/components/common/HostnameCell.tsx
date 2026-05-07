import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { truncateHostnames, hostnameToURL } from '../../utils/hostname';

interface HostnameCellProps {
  hostnames: string[];
  maxLength?: number;
  asLinks?: boolean;
}

const HostnameCell: React.FC<HostnameCellProps> = ({ hostnames, maxLength = 60, asLinks = false }) => {
  if (hostnames.length === 0) {
    return <span>-</span>;
  }

  const truncated = truncateHostnames(hostnames, maxLength);
  const needsTooltip = truncated.endsWith('...');

  const content = asLinks ? (
    <span>
      {hostnames.map((h, i) => (
        <React.Fragment key={h}>
          {i > 0 && ', '}
          <a href={hostnameToURL(h)} target="_blank" rel="noopener noreferrer">
            {h}
          </a>
        </React.Fragment>
      ))}
    </span>
  ) : (
    <span>{truncated}</span>
  );

  if (needsTooltip && !asLinks) {
    return (
      <Tooltip content={hostnames.join(', ')}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default HostnameCell;
