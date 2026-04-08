import type { Fragmentation } from "@prj-conq/behave";
import type { DoughnutItem, RankedBarItem } from "../types";

/**
 * Map fragmentation records to ranked bar items by fractal value.
 *
 * @param data - Fragmentation analysis records.
 * @returns Bar items with entity as label and fractal value as value.
 *
 * @example
 * ```ts
 * const items = mapFragmentationToBar(fragRecords);
 * ```
 */
export function mapFragmentationToBar(data: Fragmentation[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.fractalValue }));
}

/**
 * Map fragmentation records to doughnut items by fractal value.
 *
 * @param data - Fragmentation analysis records.
 * @returns Doughnut items with entity as label and fractal value as value.
 *
 * @example
 * ```ts
 * const items = mapFragmentationToDoughnut(fragRecords);
 * ```
 */
export function mapFragmentationToDoughnut(data: Fragmentation[]): DoughnutItem[] {
  return data.map((r) => ({ label: r.entity, value: r.fractalValue }));
}
