import type { MainDevByRevs } from "@prj-conq/behave";
import { html } from "lit";
import { mapMainDevToBar, mapMainDevToTreemap } from "../mappers/main-dev.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

/**
 * Main developer by revisions chart showing ownership by revision count as bar or treemap.
 *
 * @element pq-main-dev-revs-chart
 * @attr {MainDevByRevs[]} data - Inline main-dev-by-revisions records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-main-dev-revs-chart src="/api/analysis/main-dev-revs" variant="treemap"></pq-main-dev-revs-chart>
 * ```
 */
export const PqMainDevRevsChart = defineDomainChart<MainDevByRevs>({
  tag: "pq-main-dev-revs-chart",
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
    "pq-main-dev-revs-chart": InstanceType<typeof PqMainDevRevsChart>;
  }
}
