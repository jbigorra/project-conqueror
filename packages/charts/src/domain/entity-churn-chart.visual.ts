import type { EntityChurn } from "@prj-conq/behave";
import { html } from "lit";
import { mapEntityChurnToGrouped, mapEntityChurnToStacked } from "../mappers/churn.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/grouped-bar.visual";
import "../generic/stacked-bar.visual";

/**
 * Entity churn chart showing added/deleted/commits per entity.
 *
 * @element pq-entity-churn-chart
 * @attr {EntityChurn[]} data - Inline entity churn records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"grouped"|"stacked"} variant - Chart variant (default `"grouped"`).
 *
 * @example
 * ```html
 * <pq-entity-churn-chart src="/api/analysis/entity-churn" variant="stacked"></pq-entity-churn-chart>
 * ```
 */
export const PqEntityChurnChart = defineDomainChart<EntityChurn>({
  tag: "pq-entity-churn-chart",
  defaultVariant: "grouped",
  variants: {
    grouped: (data, theme) =>
      html`<pq-grouped-bar .data=${mapEntityChurnToGrouped(data)} .theme=${theme}></pq-grouped-bar>`,
    stacked: (data, theme) =>
      html`<pq-stacked-bar .data=${mapEntityChurnToStacked(data)} .theme=${theme}></pq-stacked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-entity-churn-chart": InstanceType<typeof PqEntityChurnChart>;
  }
}
