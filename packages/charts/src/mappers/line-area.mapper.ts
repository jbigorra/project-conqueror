import type { LineAreaPoint } from "../types";

export type LineAreaDatasets = {
  labels: (string | number)[];
  keys: string[];
  datasets: Array<{ label: string; data: number[] }>;
};

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
