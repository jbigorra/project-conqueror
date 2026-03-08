import type { VCSEntry } from "../types";
import { all as allAuthors } from "./authors";
import { all as allEntities, allRevisions } from "./entities";

/** One row of the summary overview: a named statistic and its numeric value. */
export type SummaryRow = { statistic: string; value: number };

/**
 * Returns a high-level statistical overview of the VCS log dataset.
 *
 * Computes four fundamental metrics used to characterise a codebase's history:
 * distinct commit count, distinct entity count, total change-log rows (one per
 * entity-per-revision), and distinct author count. These feed the summary report
 * that is typically displayed as the first output when running code-maat analysis.
 *
 * @param entries - VCS log entries. All fields (`entity`, `rev`, `author`) are used.
 * @returns Array of four `SummaryRow` objects in this fixed order:
 *   `"number-of-commits"`, `"number-of-entities"`, `"number-of-entities-changed"`,
 *   `"number-of-authors"`. Each record has `statistic` (label) and `value` (count).
 *
 * @example
 * overview(entries);
 * // [
 * //   { statistic: "number-of-commits",          value: 2 },
 * //   { statistic: "number-of-entities",         value: 2 },
 * //   { statistic: "number-of-entities-changed", value: 3 },
 * //   { statistic: "number-of-authors",          value: 2 },
 * // ]
 */
export function overview(entries: VCSEntry[]): SummaryRow[] {
  return [
    { statistic: "number-of-commits", value: allRevisions(entries).length },
    { statistic: "number-of-entities", value: allEntities(entries).length },
    { statistic: "number-of-entities-changed", value: entries.length },
    { statistic: "number-of-authors", value: allAuthors(entries).size },
  ];
}
