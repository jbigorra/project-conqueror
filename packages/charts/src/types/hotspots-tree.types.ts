export type EnclosureHotspot = {
  entity: string;
  nRevs: number;
  cyclomaticComplexity: number;
  linesOfCode: number;
};

export type HotspotsTreeNode = {
  name: string;
  children?: HotspotsTreeNode[];
  // File-level metrics (leaf nodes only)
  complexityScore?: number;
  linesOfCode?: number;
  nRevs?: number;
  // Folder-level aggregates (computed by buildHotspotsTree)
  immediateFiles?: number;
  immediateFolders?: number;
  totalFiles?: number;
  totalFolders?: number;
  totalLinesOfCode?: number;
  averageComplexity?: number;
};
