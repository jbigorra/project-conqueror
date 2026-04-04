import type { ComplexityHotspot } from "@prj-conq/behave";
import { buildHotspotsTree } from "./hotspots-tree.mapper";
import type { EnclosureHotspot } from "../types/hotspots-tree.types";

export function mapHotspotsToEnclosure(data: ComplexityHotspot[]) {
  const enriched: EnclosureHotspot[] = data.map((d) => ({
    entity: d.entity,
    nRevs: d.nRevs,
    cyclomaticComplexity: d.cyclomaticComplexity,
    linesOfCode: (d as any).linesOfCode ?? d.nRevs,
  }));
  return buildHotspotsTree(enriched);
}
