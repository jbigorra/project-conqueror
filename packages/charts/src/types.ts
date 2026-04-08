/** Data point for ranked/simple bar charts. */
export type RankedBarItem = {
  /** Display label for the bar (e.g. file path or author name). */
  label: string;
  /** Numeric value determining bar length. */
  value: number;
};

/** Data point for stacked bar charts. */
export type StackedBarItem = {
  /** Display label for the bar group (e.g. file path). */
  label: string;
  /** Segments composing the stacked bar. */
  segments: StackedSegment[];
};

/** Single segment within a stacked bar. */
export type StackedSegment = {
  /** Segment identifier used as the dataset label (e.g. "added", "deleted"). */
  key: string;
  /** Numeric value for this segment. */
  value: number;
};

/** Data point for grouped bar charts. */
export type GroupedBarItem = {
  /** Display label for the bar group (e.g. author name). */
  label: string;
  /** Sub-groups rendered side-by-side within this label. */
  groups: GroupedGroup[];
};

/** Single group within a grouped bar item. */
export type GroupedGroup = {
  /** Group identifier used as the dataset label (e.g. "commits"). */
  key: string;
  /** Numeric value for this group. */
  value: number;
};

/** Data point for bubble charts. */
export type BubbleItem = {
  /** Tooltip label identifying this bubble. */
  label: string;
  /** Horizontal axis value. */
  x: number;
  /** Vertical axis value. */
  y: number;
  /** Bubble radius (pixel size). */
  r: number;
};

/** Data point for line/area charts. */
export type LineAreaPoint = {
  /** X-axis value (date string or numeric tick). */
  x: string | number;
  /** Series values at this x position. */
  series: LineAreaSeries[];
};

/** Single series value within a line/area point. */
export type LineAreaSeries = {
  /** Series identifier used as the dataset label (e.g. "added"). */
  key: string;
  /** Numeric value for this series at the parent point. */
  value: number;
};

/** Data point for histograms (raw values, component bins them). */
export type HistogramItem = {
  /** Raw numeric value to be binned by the histogram component. */
  value: number;
};

/** Data point for doughnut/pie charts. */
export type DoughnutItem = {
  /** Slice label shown in the legend. */
  label: string;
  /** Numeric value determining slice size. */
  value: number;
};

/** Data point for treemaps. */
export type TreemapItem = {
  /** Hierarchical path segments (e.g. `["src", "utils", "helpers.ts"]`). */
  path: string[];
  /** Numeric value determining tile area. */
  value: number;
  /** Optional color index mapped to the accent palette. */
  color?: number;
};

/** Theme preset names. */
export type ThemePreset = "dark" | "light" | "pico";

/** Sort direction for bar charts. */
export type SortDirection = "asc" | "desc" | "none";

/** States for the data fetch controller. */
export type FetchState = "idle" | "loading" | "success" | "error";
