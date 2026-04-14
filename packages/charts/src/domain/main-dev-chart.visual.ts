import type { MainDev } from "@prj-conq/behave";
import { html } from "lit";
import { mapMainDevToBar, mapMainDevToTreemap } from "../mappers/main-dev.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

/**
 * Main developer chart showing code ownership percentage as bar or treemap.
 *
 * @element pq-main-dev-chart
 * @attr {MainDev[]} data - Inline main developer records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-main-dev-chart src="/api/analysis/main-dev" variant="bar" limit="15"></pq-main-dev-chart>
 * ```
 */
export const PqMainDevChart = defineDomainChart<MainDev>({
  tag: "pq-main-dev-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapMainDevToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    treemap: (data, theme) =>
      html`<pq-treemap .data=${mapMainDevToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-main-dev-chart": InstanceType<typeof PqMainDevChart>;
  }
}
