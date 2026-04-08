import type { EntityOwnership } from "@prj-conq/behave";
import type { DoughnutItem, StackedBarItem } from "../types";

/**
 * Map entity ownership records to stacked bar items (authors as segments per entity).
 *
 * @param data - Entity ownership records with per-author added lines.
 * @returns Stacked bar items grouped by entity.
 *
 * @example
 * ```ts
 * const items = mapOwnershipToStacked(ownershipRecords);
 * ```
 */
export function mapOwnershipToStacked(data: EntityOwnership[]): StackedBarItem[] {
  const map = new Map<string, Map<string, number>>();
  for (const r of data) {
    if (!map.has(r.entity)) map.set(r.entity, new Map());
    map.get(r.entity)?.set(r.author, (map.get(r.entity)?.get(r.author) ?? 0) + r.added);
  }
  return [...map.entries()].map(([entity, authors]) => ({
    label: entity,
    segments: [...authors.entries()].map(([key, value]) => ({ key, value })),
  }));
}

/**
 * Map entity ownership records to doughnut items for a single entity.
 *
 * @param data - Entity ownership records.
 * @param entity - Entity path to filter on.
 * @returns Doughnut items with author as label and added lines as value.
 *
 * @example
 * ```ts
 * const items = mapOwnershipToDoughnut(ownershipRecords, "src/app.ts");
 * ```
 */
export function mapOwnershipToDoughnut(data: EntityOwnership[], entity: string): DoughnutItem[] {
  return data.filter((r) => r.entity === entity).map((r) => ({ label: r.author, value: r.added }));
}
