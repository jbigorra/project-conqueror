import type { RankedBarItem, SortDirection } from "../types";

/**
 * Sort ranked bar items by value in the given direction.
 *
 * @param items - Items to sort (returns a new array, does not mutate).
 * @param direction - Sort direction: "asc", "desc", or "none" (returns copy as-is).
 * @returns Sorted copy of the items array.
 *
 * @example
 * ```ts
 * const sorted = sortItems(items, "desc");
 * ```
 */
export function sortItems(items: RankedBarItem[], direction: SortDirection): RankedBarItem[] {
  if (direction === "none") return [...items];
  const sorted = [...items];
  sorted.sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value));
  return sorted;
}

/**
 * Slice ranked bar items to a maximum count.
 *
 * @param items - Items to slice.
 * @param limit - Maximum number of items to keep (0 or negative returns all).
 * @returns Sliced array.
 *
 * @example
 * ```ts
 * const top10 = sliceItems(sortedItems, 10);
 * ```
 */
export function sliceItems(items: RankedBarItem[], limit: number): RankedBarItem[] {
  if (limit <= 0) return items;
  return items.slice(0, limit);
}
