import type { EnclosureHotspot, HotspotsTreeNode } from "../types/hotspots-tree.types";

/**
 * Build a recursive HotspotsTreeNode from flat hotspot records.
 *
 * Splits entity paths into folder/file segments, inserts them into a tree,
 * and computes aggregate metrics (totalFiles, totalLinesOfCode, averageComplexity).
 *
 * @param data - Flat array of enclosure hotspot records.
 * @returns Root tree node with computed aggregates on each folder node.
 *
 * @example
 * ```ts
 * const tree = buildHotspotsTree([
 *   { entity: "src/app.ts", nRevs: 10, cyclomaticComplexity: 5, linesOfCode: 200 },
 * ]);
 * ```
 */
export function buildHotspotsTree(data: EnclosureHotspot[]): HotspotsTreeNode {
  const root: HotspotsTreeNode = { name: "root" };

  for (const item of data) {
    addEntityToTree(root, item);
  }

  if (root.children?.length === 0) {
    root.children = undefined;
  }

  computeAggregates(root);

  return root;
}

function addEntityToTree(root: HotspotsTreeNode, item: EnclosureHotspot): void {
  const segments = item.entity.split("/");
  const fileSegment = segments.pop();
  if (!fileSegment) return;
  let current = root;

  for (const segment of segments) {
    current.children ??= [];
    let folder = current.children.find((c) => c.name === segment && c.children !== undefined);
    if (!folder) {
      folder = { name: segment, children: [] };
      current.children.push(folder);
    }
    current = folder;
  }

  current.children ??= [];
  current.children.push({
    name: fileSegment,
    complexityScore: item.cyclomaticComplexity,
    linesOfCode: item.linesOfCode,
    nRevs: item.nRevs,
  });
}

type Aggregates = {
  totalFiles: number;
  totalFolders: number;
  totalLinesOfCode: number;
  complexitySum: number;
};

function computeAggregates(node: HotspotsTreeNode): Aggregates {
  if (node.children === undefined) {
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

  for (const child of node.children) {
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
