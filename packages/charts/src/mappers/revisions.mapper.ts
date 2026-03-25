import type { Revision } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

export function mapRevisionsToBar(data: Revision[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.nRevs }));
}

export function mapRevisionsToTreemap(data: Revision[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.nRevs }));
}
