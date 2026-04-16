import type { EntityOwnership } from "@prj-conq/behave";
import { html } from "lit";
import { mapOwnershipToDoughnut, mapOwnershipToStacked } from "../mappers/ownership.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/doughnut.visual";
import "../generic/stacked-bar.visual";

/**
 * Entity ownership chart showing author contributions as stacked bar or doughnut.
 *
 * @element pq-ownership-chart
 * @attr {EntityOwnership[]} data - Inline entity ownership records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"stacked"|"doughnut"} variant - Chart variant (default `"stacked"`).
 * @attr {string} entity - Entity path to filter for the doughnut variant.
 *
 * @example
 * ```html
 * <pq-ownership-chart src="/api/analysis/ownership" variant="stacked"></pq-ownership-chart>
 * ```
 */
export const PqOwnershipChart = defineDomainChart<EntityOwnership, { entity: string }>({
  tag: "pq-ownership-chart",
  defaultVariant: "stacked",
  properties: { entity: {} },
  defaults: { entity: "" },
  variants: {
    doughnut: (data, theme, _limit, extra) =>
      html`<pq-doughnut
        .data=${mapOwnershipToDoughnut(data, extra?.entity ?? "")}
        .theme=${theme}
      ></pq-doughnut>`,
    stacked: (data, theme) =>
      html`<pq-stacked-bar .data=${mapOwnershipToStacked(data)} .theme=${theme}></pq-stacked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-ownership-chart": InstanceType<typeof PqOwnershipChart>;
  }
}
