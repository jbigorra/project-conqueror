import type { EntityEffort } from "@prj-conq/behave";
import type { DoughnutItem, StackedBarItem } from "../types";

/**
 * Map entity effort records to stacked bar items (authors as segments per entity).
 *
 * @param data - Entity effort records with per-author revision counts.
 * @returns Stacked bar items grouped by entity.
 *
 * @example
 * ```ts
 * const items = mapEffortToStacked(effortRecords);
 * // [{ label: "src/app.ts", segments: [{ key: "Alice", value: 10 }, ...] }]
 * ```
 */
export function mapEffortToStacked(data: EntityEffort[]): StackedBarItem[] {
  const map = new Map<string, Map<string, number>>();
  for (const r of data) {
    if (!map.has(r.entity)) map.set(r.entity, new Map());
    map.get(r.entity)?.set(r.author, (map.get(r.entity)?.get(r.author) ?? 0) + r.authorRevs);
  }
  return [...map.entries()].map(([entity, authors]) => ({
    label: entity,
    segments: [...authors.entries()].map(([key, value]) => ({ key, value })),
  }));
}

/**
 * Map entity effort records to doughnut items for a single entity.
 *
 * @param data - Entity effort records.
 * @param entity - Entity path to filter on.
 * @returns Doughnut items with author as label and revision count as value.
 *
 * @example
 * ```ts
 * const items = mapEffortToDoughnut(effortRecords, "src/app.ts");
 * // [{ label: "Alice", value: 10 }, { label: "Bob", value: 5 }]
 * ```
 */
export function mapEffortToDoughnut(data: EntityEffort[], entity: string): DoughnutItem[] {
  return data
    .filter((r) => r.entity === entity)
    .map((r) => ({ label: r.author, value: r.authorRevs }));
}
