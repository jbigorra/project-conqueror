import type { Soc } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

/**
 * Map sum-of-coupling (SOC) records to ranked bar items.
 *
 * @param data - SOC analysis records.
 * @returns Bar items with entity as label and SOC score as value.
 *
 * @example
 * ```ts
 * const items = mapSocToBar(socRecords);
 * ```
 */
export function mapSocToBar(data: Soc[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.soc }));
}
