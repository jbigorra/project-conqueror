import type { CodeAge } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

/**
 * Extract raw age values for histogram binning.
 *
 * @param data - Code age analysis records.
 * @returns Array of age values in months.
 *
 * @example
 * ```ts
 * const values = mapAgeToHistogram(ageRecords);
 * // [12, 3, 24, ...]
 * ```
 */
export function mapAgeToHistogram(data: CodeAge[]): number[] {
  return data.map((r) => r.ageMonths);
}

/**
 * Map code age records to ranked bar items.
 *
 * @param data - Code age analysis records.
 * @returns Bar items with entity as label and age in months as value.
 *
 * @example
 * ```ts
 * const items = mapAgeToBar(ageRecords);
 * // [{ label: "src/app.ts", value: 18 }, ...]
 * ```
 */
export function mapAgeToBar(data: CodeAge[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ageMonths }));
}
