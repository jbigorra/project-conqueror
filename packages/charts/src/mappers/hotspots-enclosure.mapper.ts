import type { ComplexityHotspot } from "@prj-conq/behave";
import type { EnclosureHotspot } from "../types/hotspots-tree.types";
import { buildHotspotsTree } from "./hotspots-tree.mapper";

type ExtendedHotspot = ComplexityHotspot & { linesOfCode?: number };

/**
 * Map complexity hotspot records to a HotspotsTreeNode for the enclosure diagram.
 *
 * Enriches each record with `linesOfCode` (falls back to `nRevs`) then builds
 * the recursive tree via {@link buildHotspotsTree}.
 *
 * @param data - Complexity hotspot records.
 * @returns Root HotspotsTreeNode for use with `pq-enclosure`.
 *
 * @example
 * ```ts
 * const tree = mapHotspotsToEnclosure(hotspotRecords);
 * html`<pq-enclosure .data=${tree}></pq-enclosure>`;
 * ```
 */
export function mapHotspotsToEnclosure(data: ComplexityHotspot[]) {
  const enriched: EnclosureHotspot[] = data.map((d) => {
    const ext = d as ExtendedHotspot;
    return {
      entity: d.entity,
      nRevs: d.nRevs,
      cyclomaticComplexity: d.cyclomaticComplexity,
      linesOfCode: ext.linesOfCode ?? d.nRevs,
    };
  });
  return buildHotspotsTree(enriched);
}
