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

  computeAggregates(root);

  return root;
}

type Aggregates = {
  totalFiles: number;
  totalFolders: number;
  totalLinesOfCode: number;
  complexitySum: number;
};

function computeAggregates(node: HotspotsTreeNode): Aggregates {
  const isFolder = node.children !== undefined;

  if (!isFolder) {
    return {
      totalFiles: 1,
      totalFolders: 0,
      totalLinesOfCode: node.linesOfCode ?? 0,
      complexitySum: node.complexityScore ?? 0,
    };
  }

  let totalFiles = 0;
  let totalFolders = 0;
  let totalLinesOfCode = 0;
  let complexitySum = 0;
  let immediateFiles = 0;
  let immediateFolders = 0;

  for (const child of node.children!) {
    const childIsFolder = child.children !== undefined;
    if (childIsFolder) {
      immediateFolders++;
    } else {
      immediateFiles++;
    }

    const childAgg = computeAggregates(child);
    totalFiles += childAgg.totalFiles;
    totalFolders += childAgg.totalFolders + (childIsFolder ? 1 : 0);
    totalLinesOfCode += childAgg.totalLinesOfCode;
    complexitySum += childAgg.complexitySum;
  }

  node.immediateFiles = immediateFiles;
  node.immediateFolders = immediateFolders;
  node.totalFiles = totalFiles;
  node.totalFolders = totalFolders;
  node.totalLinesOfCode = totalLinesOfCode;
  node.averageComplexity = totalFiles > 0 ? complexitySum / totalFiles : 0;

  return { totalFiles, totalFolders, totalLinesOfCode, complexitySum };
}
