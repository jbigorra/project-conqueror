/** Data point for ranked/simple bar charts */
export type RankedBarItem = {
  label: string;
  value: number;
};

/** Data point for stacked bar charts */
export type StackedBarItem = {
  label: string;
  segments: StackedSegment[];
};

export type StackedSegment = {
  key: string;
  value: number;
};

/** Data point for grouped bar charts */
export type GroupedBarItem = {
  label: string;
  groups: GroupedGroup[];
};

export type GroupedGroup = {
  key: string;
  value: number;
};

/** Data point for bubble charts */
export type BubbleItem = {
  label: string;
  x: number;
  y: number;
  r: number;
};

/** Data point for line/area charts */
export type LineAreaPoint = {
  x: string | number;
  series: LineAreaSeries[];
};

export type LineAreaSeries = {
  key: string;
  value: number;
};

/** Data point for histograms (raw values, component bins them) */
export type HistogramItem = {
  value: number;
};

/** Data point for doughnut/pie charts */
export type DoughnutItem = {
  label: string;
  value: number;
};

/** Data point for treemaps */
export type TreemapItem = {
  path: string[];
  value: number;
  color?: number;
};

/** Theme preset names */
export type ThemePreset = "dark" | "light" | "pico";

/** Sort direction for bar charts */
export type SortDirection = "asc" | "desc" | "none";

/** States for the data fetch controller */
export type FetchState = "idle" | "loading" | "success" | "error";
