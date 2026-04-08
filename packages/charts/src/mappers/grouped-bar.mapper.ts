import type { GroupedBarItem } from "../types";

/** Output shape produced by {@link buildGroupedDatasets}. */
export type GroupedDatasets = {
  /** Category labels (one per GroupedBarItem). */
  labels: string[];
  /** Unique group keys across all items. */
  keys: string[];
  /** One dataset per group key, each containing values aligned to labels. */
  datasets: Array<{ label: string; data: number[] }>;
};

/**
 * Transform grouped bar items into Chart.js-ready datasets.
 *
 * @param items - Grouped bar items to transform.
 * @returns Labels and datasets ready for a Chart.js bar config.
 *
 * @example
 * ```ts
 * const { labels, datasets } = buildGroupedDatasets([
 *   { label: "Alice", groups: [{ key: "added", value: 50 }, { key: "deleted", value: 10 }] },
 * ]);
 * ```
 */
export function buildGroupedDatasets(items: GroupedBarItem[]): GroupedDatasets {
  if (items.length === 0) return { labels: [], keys: [], datasets: [] };

  const labels = items.map((item) => item.label);

  // Collect unique keys preserving insertion order
  const keySet = new Set<string>();
  for (const item of items) {
    for (const grp of item.groups) {
      keySet.add(grp.key);
    }
  }
  const keys = Array.from(keySet);

  const datasets = keys.map((key) => ({
    label: key,
    data: items.map((item) => {
      const grp = item.groups.find((g) => g.key === key);
      return grp ? grp.value : 0;
    }),
  }));

  return { labels, keys, datasets };
}
