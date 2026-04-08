import type { AbsChurn, AuthorChurn, EntityChurn } from "@prj-conq/behave";
import type { GroupedBarItem, LineAreaPoint, StackedBarItem } from "../types";

/**
 * Map absolute churn records to line/area points with added/deleted series.
 *
 * @param data - Absolute churn records (one per date).
 * @returns Line area points keyed by date.
 *
 * @example
 * ```ts
 * const points = mapAbsChurnToLineArea(absChurnRecords);
 * // [{ x: "2024-01-15", series: [{ key: "added", value: 100 }, { key: "deleted", value: 20 }] }]
 * ```
 */
export function mapAbsChurnToLineArea(data: AbsChurn[]): LineAreaPoint[] {
  return data.map((r) => ({
    x: r.date,
    series: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
    ],
  }));
}

/**
 * Map author churn records to grouped bar items (added, deleted, commits per author).
 *
 * @param data - Author churn records.
 * @returns Grouped bar items keyed by author.
 *
 * @example
 * ```ts
 * const items = mapAuthorChurnToGrouped(authorChurnRecords);
 * ```
 */
export function mapAuthorChurnToGrouped(data: AuthorChurn[]): GroupedBarItem[] {
  return data.map((r) => ({
    label: r.author,
    groups: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

/**
 * Map author churn records to stacked bar items (added, deleted, commits per author).
 *
 * @param data - Author churn records.
 * @returns Stacked bar items keyed by author.
 *
 * @example
 * ```ts
 * const items = mapAuthorChurnToStacked(authorChurnRecords);
 * ```
 */
export function mapAuthorChurnToStacked(data: AuthorChurn[]): StackedBarItem[] {
  return data.map((r) => ({
    label: r.author,
    segments: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

/**
 * Map entity churn records to grouped bar items (added, deleted, commits per entity).
 *
 * @param data - Entity churn records.
 * @returns Grouped bar items keyed by entity path.
 *
 * @example
 * ```ts
 * const items = mapEntityChurnToGrouped(entityChurnRecords);
 * ```
 */
export function mapEntityChurnToGrouped(data: EntityChurn[]): GroupedBarItem[] {
  return data.map((r) => ({
    label: r.entity,
    groups: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

/**
 * Map entity churn records to stacked bar items (added, deleted, commits per entity).
 *
 * @param data - Entity churn records.
 * @returns Stacked bar items keyed by entity path.
 *
 * @example
 * ```ts
 * const items = mapEntityChurnToStacked(entityChurnRecords);
 * ```
 */
export function mapEntityChurnToStacked(data: EntityChurn[]): StackedBarItem[] {
  return data.map((r) => ({
    label: r.entity,
    segments: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}
