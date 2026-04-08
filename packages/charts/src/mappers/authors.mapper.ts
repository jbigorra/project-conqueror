import type { Author } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

/**
 * Map author analysis records to ranked bar items (author count per entity).
 *
 * @param data - Author analysis records.
 * @returns Bar items with entity as label and author count as value.
 *
 * @example
 * ```ts
 * const items = mapAuthorsToBar(authorRecords);
 * // [{ label: "src/app.ts", value: 5 }, ...]
 * ```
 */
export function mapAuthorsToBar(data: Author[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.nAuthors }));
}

/**
 * Map author records to treemap items with path hierarchy and author count as colour.
 *
 * @param data - Author analysis records.
 * @returns Treemap items where value is revision count and colour is author count.
 *
 * @example
 * ```ts
 * const items = mapAuthorsToTreemap(authorRecords);
 * // [{ path: ["src", "app.ts"], value: 42, color: 5 }, ...]
 * ```
 */
export function mapAuthorsToTreemap(data: Author[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.nRevs, color: r.nAuthors }));
}
