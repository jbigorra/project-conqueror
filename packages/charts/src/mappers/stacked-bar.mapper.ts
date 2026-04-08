import type { StackedBarItem } from "../types";

/** Output shape produced by {@link buildStackedDatasets}. */
export type StackedDatasets = {
  /** Category labels (one per StackedBarItem). */
  labels: string[];
  /** Unique segment keys across all items. */
  keys: string[];
  /** One dataset per segment key, values aligned to labels. */
  datasets: Array<{ label: string; data: number[] }>;
};

/**
 * Transform stacked bar items into Chart.js-ready datasets.
 *
 * @param items - Stacked bar items to transform.
 * @returns Labels and datasets ready for a Chart.js stacked bar config.
 *
 * @example
 * ```ts
 * const { labels, datasets } = buildStackedDatasets([
 *   { label: "file.ts", segments: [{ key: "added", value: 50 }, { key: "deleted", value: 10 }] },
 * ]);
 * ```
 */
export function buildStackedDatasets(items: StackedBarItem[]): StackedDatasets {
  if (items.length === 0) return { labels: [], keys: [], datasets: [] };

  const labels = items.map((item) => item.label);

  // Collect unique keys preserving insertion order
  const keySet = new Set<string>();
  for (const item of items) {
    for (const seg of item.segments) {
      keySet.add(seg.key);
    }
  }
  const keys = Array.from(keySet);

  const datasets = keys.map((key) => ({
    label: key,
    data: items.map((item) => {
      const seg = item.segments.find((s) => s.key === key);
      return seg ? seg.value : 0;
    }),
  }));

  return { labels, keys, datasets };
}
