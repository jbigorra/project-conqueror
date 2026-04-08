import type { ComplexityHotspot } from "@prj-conq/behave";
import type { BubbleItem, TreemapItem } from "../types";

/**
 * Map complexity hotspot records to bubble items (x=revisions, y=complexity, r=revisions).
 *
 * @param data - Complexity hotspot records.
 * @returns Bubble items keyed by entity path.
 *
 * @example
 * ```ts
 * const items = mapHotspotsToBubble(hotspotRecords);
 * ```
 */
export function mapHotspotsToBubble(data: ComplexityHotspot[]): BubbleItem[] {
  return data.map((r) => ({
    label: r.entity,
    x: r.nRevs,
    y: r.cyclomaticComplexity,
    r: r.nRevs,
  }));
}

/**
 * Map complexity hotspot records to treemap items with path hierarchy.
 *
 * @param data - Complexity hotspot records.
 * @returns Treemap items where value is revision count and colour is complexity.
 *
 * @example
 * ```ts
 * const items = mapHotspotsToTreemap(hotspotRecords);
 * ```
 */
export function mapHotspotsToTreemap(data: ComplexityHotspot[]): TreemapItem[] {
  return data.map((r) => ({
    path: r.entity.split("/"),
    value: r.nRevs,
    color: r.cyclomaticComplexity,
  }));
}
