import type { EntityEffort } from "@prj-conq/behave";
import type { StackedBarItem, DoughnutItem } from "../types";

export function mapEffortToStacked(data: EntityEffort[]): StackedBarItem[] {
  const map = new Map<string, Map<string, number>>();
  for (const r of data) {
    if (!map.has(r.entity)) map.set(r.entity, new Map());
    map.get(r.entity)!.set(r.author, (map.get(r.entity)!.get(r.author) ?? 0) + r.authorRevs);
  }
  return [...map.entries()].map(([entity, authors]) => ({
    label: entity,
    segments: [...authors.entries()].map(([key, value]) => ({ key, value })),
  }));
}

export function mapEffortToDoughnut(data: EntityEffort[], entity: string): DoughnutItem[] {
  return data
    .filter((r) => r.entity === entity)
    .map((r) => ({ label: r.author, value: r.authorRevs }));
}
