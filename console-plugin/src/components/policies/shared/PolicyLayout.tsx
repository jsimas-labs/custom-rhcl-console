import * as React from 'react';
import {
  PageSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';

interface Props {
  header: React.ReactNode;
  // Stacked vertically in the wide left column (8/12).
  mainColumn: React.ReactNode;
  // Stacked vertically in the narrow right column (4/12).
  sideColumn: React.ReactNode;
}

// 16px gap — matches PatternFly's `spaceItemsMd` token while sidestepping
// the React.Children.map-vs-Fragment trap that PatternFly's <Flex> hit
// when we passed the cards in via `<>...</>`.
const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

/**
 * Outer layout shared by every Kuadrant policy detail page. Keeps the
 * "header → 2-column body" geometry consistent so the operator's eye
 * lands on the same things in the same place regardless of policy kind.
 */
export const PolicyLayout: React.FC<Props> = ({ header, mainColumn, sideColumn }) => (
  <>
    <PageSection variant="default">{header}</PageSection>
    <PageSection>
      <Grid hasGutter>
        <GridItem lg={8} md={12}>
          <div style={stackStyle}>{mainColumn}</div>
        </GridItem>
        <GridItem lg={4} md={12}>
          <div style={stackStyle}>{sideColumn}</div>
        </GridItem>
      </Grid>
    </PageSection>
  </>
);

export default PolicyLayout;
