import type { AbsChurn } from "@prj-conq/behave";
import { html } from "lit";
import { mapAbsChurnToLineArea } from "../mappers/churn.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/line-area.visual";

/**
 * Absolute churn chart showing added/deleted lines over time.
 *
 * Delegates to `pq-line-area` after mapping AbsChurn records.
 *
 * @element pq-abs-churn-chart
 * @attr {AbsChurn[]} data - Inline absolute churn records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"area"|"line"} variant - Render as filled area or plain lines (default `"area"`).
 *
 * @example
 * ```html
 * <pq-abs-churn-chart src="/api/analysis/abs-churn" theme="dark" variant="area"></pq-abs-churn-chart>
 * ```
 */
export const PqAbsChurnChart = defineDomainChart<AbsChurn>({
  tag: "pq-abs-churn-chart",
  defaultVariant: "area",
  variants: {
    area: (data, theme) =>
      html`<pq-line-area
        .data=${mapAbsChurnToLineArea(data)}
        .theme=${theme}
        .fill=${true}
        show-legend
      ></pq-line-area>`,
    line: (data, theme) =>
      html`<pq-line-area
        .data=${mapAbsChurnToLineArea(data)}
        .theme=${theme}
        .fill=${false}
        show-legend
      ></pq-line-area>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-abs-churn-chart": InstanceType<typeof PqAbsChurnChart>;
  }
}
