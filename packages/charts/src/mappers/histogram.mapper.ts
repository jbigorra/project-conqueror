import type { RankedBarItem } from "../types";

/**
 * Bin numeric values into equal-width or custom buckets.
 *
 * @param values - Raw numeric values to bin.
 * @param bins - Number of equal-width bins, or an array of custom boundaries.
 * @returns Ranked bar items where label is the bin range and value is the count.
 *
 * @example
 * ```ts
 * const binned = binValues([1, 3, 5, 7, 9], 3);
 * // [{ label: "1-4", value: 2 }, { label: "4-7", value: 2 }, { label: "7-9", value: 1 }]
 * ```
 */
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
