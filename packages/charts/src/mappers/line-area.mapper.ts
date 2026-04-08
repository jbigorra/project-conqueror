import type { LineAreaPoint } from "../types";

/** Output shape produced by {@link buildLineAreaDatasets}. */
export type LineAreaDatasets = {
  /** X-axis labels (dates or numeric ticks). */
  labels: (string | number)[];
  /** Unique series keys across all points. */
  keys: string[];
  /** One dataset per series key, values aligned to labels. */
  datasets: Array<{ label: string; data: number[] }>;
};

/**
 * Transform line/area points into Chart.js-ready datasets.
 *
 * @param points - Line area points to transform.
 * @returns Labels and datasets ready for a Chart.js line config.
 *
 * @example
 * ```ts
 * const { labels, datasets } = buildLineAreaDatasets([
 *   { x: "2024-01", series: [{ key: "added", value: 100 }] },
 * ]);
 * ```
 */
export function buildLineAreaDatasets(points: LineAreaPoint[]): LineAreaDatasets {
  if (points.length === 0) return { labels: [], keys: [], datasets: [] };

  const labels = points.map((p) => p.x);

  // Collect unique series keys preserving insertion order
  const keySet = new Set<string>();
  for (const point of points) {
    for (const s of point.series) {
      keySet.add(s.key);
    }
  }
  const keys = Array.from(keySet);

  const datasets = keys.map((key) => ({
    label: key,
    data: points.map((point) => {
      const s = point.series.find((ser) => ser.key === key);
      return s ? s.value : 0;
    }),
  }));

  return { labels, keys, datasets };
}
