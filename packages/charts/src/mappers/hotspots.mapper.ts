import type { ComplexityHotspot } from "@prj-conq/behave";
import type { BubbleItem, TreemapItem } from "../types";

export function mapHotspotsToBubble(data: ComplexityHotspot[]): BubbleItem[] {
  return data.map((r) => ({
    label: r.entity,
    x: r.nRevs,
    y: r.cyclomaticComplexity,
    r: r.nRevs,
  }));
}

export function mapHotspotsToTreemap(data: ComplexityHotspot[]): TreemapItem[] {
  return data.map((r) => ({
    path: r.entity.split("/"),
    value: r.nRevs,
    color: r.cyclomaticComplexity,
  }));
}
