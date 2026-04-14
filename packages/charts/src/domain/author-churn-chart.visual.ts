import type { AuthorChurn } from "@prj-conq/behave";
import { html } from "lit";
import { mapAuthorChurnToGrouped, mapAuthorChurnToStacked } from "../mappers/churn.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/grouped-bar.visual";
import "../generic/stacked-bar.visual";

/**
 * Author churn chart showing added/deleted/commits per author.
 *
 * @element pq-author-churn-chart
 * @attr {AuthorChurn[]} data - Inline author churn records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"grouped"|"stacked"} variant - Chart variant (default `"grouped"`).
 *
 * @example
 * ```html
 * <pq-author-churn-chart src="/api/analysis/author-churn" variant="grouped"></pq-author-churn-chart>
 * ```
 */
export const PqAuthorChurnChart = defineDomainChart<AuthorChurn>({
  tag: "pq-author-churn-chart",
  defaultVariant: "grouped",
  variants: {
    grouped: (data, theme) =>
      html`<pq-grouped-bar .data=${mapAuthorChurnToGrouped(data)} .theme=${theme}></pq-grouped-bar>`,
    stacked: (data, theme) =>
      html`<pq-stacked-bar .data=${mapAuthorChurnToStacked(data)} .theme=${theme}></pq-stacked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-author-churn-chart": InstanceType<typeof PqAuthorChurnChart>;
  }
}
