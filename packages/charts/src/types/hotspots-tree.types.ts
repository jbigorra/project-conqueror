/** Input record for the enclosure diagram mapper. */
export type EnclosureHotspot = {
  /** File path (e.g. "src/utils/helpers.ts"). */
  entity: string;
  /** Number of VCS revisions for this file. */
  nRevs: number;
  /** Cyclomatic complexity score. */
  cyclomaticComplexity: number;
  /** Total lines of code. */
  linesOfCode: number;
};

/** Recursive tree node used by `pq-enclosure` for circle-packing layout. */
export type HotspotsTreeNode = {
  /** Directory or file name (leaf segment of the path). */
  name: string;
  /** Child nodes; present for directories, absent for files. */
  children?: HotspotsTreeNode[];
  /** Cyclomatic complexity of this file (leaf nodes only). */
  complexityScore?: number;
  /** Lines of code in this file (leaf nodes only). */
  linesOfCode?: number;
  /** Number of VCS revisions (leaf nodes only). */
  nRevs?: number;
  /** Direct file children count (computed by buildHotspotsTree). */
  immediateFiles?: number;
  /** Direct folder children count (computed by buildHotspotsTree). */
  immediateFolders?: number;
  /** Total file descendants (computed by buildHotspotsTree). */
  totalFiles?: number;
  /** Total folder descendants (computed by buildHotspotsTree). */
  totalFolders?: number;
  /** Sum of lines of code across all descendants (computed by buildHotspotsTree). */
  totalLinesOfCode?: number;
  /** Mean complexity across all file descendants (computed by buildHotspotsTree). */
  averageComplexity?: number;
};
