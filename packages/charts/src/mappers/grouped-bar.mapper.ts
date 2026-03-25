import type { GroupedBarItem } from "../types";

export type GroupedDatasets = {
  labels: string[];
  keys: string[];
  datasets: Array<{ label: string; data: number[] }>;
};

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
