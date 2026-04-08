import type { MessageEntry } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

/**
 * Map commit message analysis records to ranked bar items by match count.
 *
 * @param data - Message entry records from commit message analysis.
 * @returns Bar items with entity as label and match count as value.
 *
 * @example
 * ```ts
 * const items = mapMessagesToBar(messageRecords);
 * // [{ label: "src/app.ts", value: 15 }, ...]
 * ```
 */
export function mapMessagesToBar(data: MessageEntry[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.matches }));
}
