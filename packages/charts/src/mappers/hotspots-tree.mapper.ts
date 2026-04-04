import type { EnclosureHotspot, HotspotsTreeNode } from "../types/hotspots-tree.types";

export function buildHotspotsTree(data: EnclosureHotspot[]): HotspotsTreeNode {
  const root: HotspotsTreeNode = { name: "root" };

  for (const item of data) {
    const segments = item.entity.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      const isFile = i === segments.length - 1;

      if (isFile) {
        current.children ??= [];
        current.children.push({
          name: segment,
          complexityScore: item.cyclomaticComplexity,
          linesOfCode: item.linesOfCode,
          nRevs: item.nRevs,
        });
      } else {
        current.children ??= [];
        let folder = current.children.find((c) => c.name === segment && c.children !== undefined);
        if (!folder) {
          folder = { name: segment, children: [] };
          current.children.push(folder);
        }
        current = folder;
      }
    }
  }

  if (root.children?.length === 0) {
    root.children = undefined;
  }

  return root;
}
