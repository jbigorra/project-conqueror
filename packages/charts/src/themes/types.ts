/** Complete set of colour and font tokens consumed by chart components. */
export type ThemeValues = {
  /** Chart background colour. */
  bg: string;
  /** Primary text and label colour. */
  text: string;
  /** Grid line colour. */
  grid: string;
  /** Border colour for axes and tooltips. */
  border: string;
  /** Tooltip background colour. */
  tooltipBg: string;
  /** CSS font-family string. */
  fontFamily: string;
  /** Base font size as a CSS value (e.g. "12px"). */
  fontSize: string;
  /** Colour used for danger/error indicators. */
  danger: string;
  /** Ordered accent colours for datasets (up to 8). */
  accents: string[];
};
