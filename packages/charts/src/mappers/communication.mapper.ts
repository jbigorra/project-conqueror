import type { Communication } from "@prj-conq/behave";
import type { BubbleItem, RankedBarItem } from "../types";

/**
 * Map communication records to bubble items (x=shared, y=average, r=strength).
 *
 * @param data - Communication analysis records.
 * @returns Bubble items labelled as "author<>peer".
 *
 * @example
 * ```ts
 * const items = mapCommunicationToBubble(commRecords);
 * // [{ label: "Alice<>Bob", x: 5, y: 3.2, r: 8 }]
 * ```
 */
export function mapCommunicationToBubble(data: Communication[]): BubbleItem[] {
  return data.map((r) => ({
    label: `${r.author}↔${r.peer}`,
    x: r.shared,
    y: r.average,
    r: r.strength,
  }));
}

/**
 * Map communication records to ranked bar items by strength.
 *
 * @param data - Communication analysis records.
 * @returns Bar items labelled as "author<>peer" with strength as value.
 *
 * @example
 * ```ts
 * const items = mapCommunicationToBar(commRecords);
 * ```
 */
export function mapCommunicationToBar(data: Communication[]): RankedBarItem[] {
  return data.map((r) => ({ label: `${r.author}↔${r.peer}`, value: r.strength }));
}
