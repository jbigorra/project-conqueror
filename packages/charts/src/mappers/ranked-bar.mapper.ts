import type { RankedBarItem, SortDirection } from "../types";

export function sortItems(items: RankedBarItem[], direction: SortDirection): RankedBarItem[] {
  if (direction === "none") return [...items];
  const sorted = [...items];
  sorted.sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value));
  return sorted;
}

export function sliceItems(items: RankedBarItem[], limit: number): RankedBarItem[] {
  if (limit <= 0) return items;
  return items.slice(0, limit);
}
