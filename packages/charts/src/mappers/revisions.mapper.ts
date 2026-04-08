import type { Revision } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

/**
 * Map revision records to ranked bar items by revision count.
 *
 * @param data - Revision analysis records.
 * @returns Bar items with entity as label and revision count as value.
 *
 * @example
 * ```ts
 * const items = mapRevisionsToBar(revisionRecords);
 * ```
 */
export function mapRevisionsToBar(data: Revision[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.nRevs }));
}

/**
 * Map revision records to treemap items with path hierarchy.
 *
 * @param data - Revision analysis records.
 * @returns Treemap items where value is revision count.
 *
 * @example
 * ```ts
 * const items = mapRevisionsToTreemap(revisionRecords);
 * ```
 */
export function mapRevisionsToTreemap(data: Revision[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.nRevs }));
}
