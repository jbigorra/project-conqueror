import type { StackedBarItem } from "../types";

export type StackedDatasets = {
  labels: string[];
  keys: string[];
  datasets: Array<{ label: string; data: number[] }>;
};

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
