import * as React from 'react';

/**
 * Returns a [ref, width] tuple. Attach the ref to the immediate parent of a
 * Victory `<Chart>`; pass the width to the chart's `width` prop. Re-measures
 * on container resize.
 *
 * Why this exists: Victory's <Chart> defaults to a fixed 450x300 viewport
 * when width is omitted. The SVG is then CSS-stretched to the container,
 * which scales legend fonts, axis labels and tick text along with it — the
 * "Allowed / Rejected" legend ends up at 60pt on an HD monitor. Pinning
 * `width` to the actual pixel width keeps fonts at their authored size.
 */
export function useResponsiveChartWidth(initial = 600): [
  React.RefObject<HTMLDivElement>,
  number,
] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>(initial);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
