import type { ComplexityHotspot } from "@prj-conq/behave";
import type { EnclosureHotspot } from "../types/hotspots-tree.types";
import { buildHotspotsTree } from "./hotspots-tree.mapper";

type ExtendedHotspot = ComplexityHotspot & { linesOfCode?: number };

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
