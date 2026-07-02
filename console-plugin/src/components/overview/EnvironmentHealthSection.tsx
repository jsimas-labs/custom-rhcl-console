import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import {
  NetworkIcon,
  RouteIcon,
  SecurityIcon,
  ServerIcon,
  CubesIcon,
} from '@patternfly/react-icons';
import EnvironmentHealthCard from './EnvironmentHealthCard';
import { EnvironmentHealthCardData } from './types';

interface Props {
  cards: EnvironmentHealthCardData[];
}

// Map card id → icon. Keeps the card itself generic; icon assignment is a
// pure UI concern that lives next to the section that arranges them.
const ICONS: Record<string, React.ReactNode> = {
  gateways: <NetworkIcon color="var(--pf-v5-global--info-color--100)" />,
  httproutes: <RouteIcon color="var(--pf-v5-global--info-color--100)" />,
  policies: <SecurityIcon color="var(--pf-v5-global--success-color--100)" />,
  backends: <ServerIcon color="var(--pf-v5-global--warning-color--100)" />,
  'api-products': <CubesIcon color="var(--pf-v5-global--info-color--100)" />,
};

/**
 * Row of 5 KPI cards. Stays 5-wide on xl, wraps on smaller breakpoints.
 */
export const EnvironmentHealthSection: React.FC<Props> = ({ cards }) => {
  return (
    <Grid hasGutter>
      {cards.map((c) => (
        <GridItem key={c.id} xl={Math.floor(12 / Math.max(cards.length, 1)) as 2 | 3 | 4 | 6} lg={4} md={6} sm={12}>
          <EnvironmentHealthCard data={c} iconSlot={ICONS[c.id]} />
        </GridItem>
      ))}
    </Grid>
  );
};

export default EnvironmentHealthSection;
