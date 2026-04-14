import type { Fragmentation } from "@prj-conq/behave";
import { html } from "lit";
import { mapFragmentationToBar, mapFragmentationToDoughnut } from "../mappers/fragmentation.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/doughnut.visual";
import "../generic/ranked-bar.visual";

/**
 * Fragmentation chart showing knowledge fragmentation (fractal value) as bar or doughnut.
 *
 * @element pq-fragmentation-chart
 * @attr {Fragmentation[]} data - Inline fragmentation records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"doughnut"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-fragmentation-chart src="/api/analysis/fragmentation" variant="bar" limit="15"></pq-fragmentation-chart>
 * ```
 */
export const PqFragmentationChart = defineDomainChart<Fragmentation>({
  tag: "pq-fragmentation-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapFragmentationToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    doughnut: (data, theme) =>
      html`<pq-doughnut .data=${mapFragmentationToDoughnut(data)} .theme=${theme}></pq-doughnut>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-fragmentation-chart": InstanceType<typeof PqFragmentationChart>;
  }
}
