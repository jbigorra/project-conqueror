import type { EntityEffort } from "@prj-conq/behave";
import { html } from "lit";
import { mapEffortToDoughnut, mapEffortToStacked } from "../mappers/effort.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/doughnut.visual";
import "../generic/stacked-bar.visual";

/**
 * Effort chart showing author contributions per entity as stacked bar or doughnut.
 *
 * @element pq-effort-chart
 * @attr {EntityEffort[]} data - Inline entity effort records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"stacked"|"doughnut"} variant - Chart variant (default `"stacked"`).
 * @attr {string} entity - Entity path to filter for the doughnut variant.
 *
 * @example
 * ```html
 * <pq-effort-chart src="/api/analysis/effort" variant="stacked"></pq-effort-chart>
 * ```
 */
export const PqEffortChart = defineDomainChart<EntityEffort, { entity: string }>({
  tag: "pq-effort-chart",
  defaultVariant: "stacked",
  properties: { entity: {} },
  defaults: { entity: "" },
  variants: {
    doughnut: (data, theme, _limit, extra) =>
      html`<pq-doughnut
        .data=${mapEffortToDoughnut(data, extra?.entity ?? "")}
        .theme=${theme}
      ></pq-doughnut>`,
    stacked: (data, theme) =>
      html`<pq-stacked-bar .data=${mapEffortToStacked(data)} .theme=${theme}></pq-stacked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-effort-chart": InstanceType<typeof PqEffortChart>;
  }
}
