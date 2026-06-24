import * as React from 'react';
import { SparklinePoint } from './mockOverviewData';

interface SparklineProps {
  data: SparklinePoint[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fill?: boolean;
}

/**
 * Minimal inline SVG sparkline. Renders the area+line of a series, scaled to
 * the given box. No deps on @patternfly/react-charts (which is much heavier
 * and overkill for a 30-point trend indicator).
 *
 * Color defaults to currentColor so the parent can theme it via PF status
 * classes (e.g. pf-v5-u-color-success-100 on a wrapping span) without us
 * having to know about the theme here.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = 'currentColor',
  width = 120,
  height = 36,
  strokeWidth = 1.5,
  fill = true,
}) => {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }
  const ys = data.map((p) => p.v);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  // 1px padding so stroke isn't clipped at the top/bottom of the box
  const pad = strokeWidth + 1;
  const usableH = height - 2 * pad;
  const stepX = width / (data.length - 1);
  const points = data.map((p, i) => {
    const x = i * stepX;
    const y = pad + usableH * (1 - (p.v - min) / range);
    return [x, y];
  });
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
  const areaPath = fill
    ? `${linePath} L ${width.toFixed(2)} ${height} L 0 ${height} Z`
    : '';
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {fill && (
        <path
          d={areaPath}
          fill={color}
          fillOpacity={0.15}
          stroke="none"
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
