import type { RankedBarItem } from "../types";

export function binValues(values: number[], bins: number | number[]): RankedBarItem[] {
  if (values.length === 0) return [];
  const boundaries = Array.isArray(bins) ? bins : createEqualBoundaries(values, bins);
  const counts: RankedBarItem[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const low = boundaries[i] as number;
    const high = boundaries[i + 1] as number;
    const count = values.filter((v) => v >= low && v < high).length;
    counts.push({ label: `${low}-${high}`, value: count });
  }
  return counts;
}

function createEqualBoundaries(values: number[], binCount: number): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount;
  return Array.from({ length: binCount + 1 }, (_, i) => Math.round(min + step * i));
}
