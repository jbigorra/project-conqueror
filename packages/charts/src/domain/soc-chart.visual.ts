import type { Soc } from "@prj-conq/behave";
import { html } from "lit";
import { mapSocToBar } from "../mappers/soc.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";

/**
 * Sum-of-coupling (SOC) chart showing coupling scores as a ranked bar.
 *
 * @element pq-soc-chart
 * @attr {Soc[]} data - Inline SOC records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (default `20`).
 *
 * @example
 * ```html
 * <pq-soc-chart src="/api/analysis/soc" limit="15"></pq-soc-chart>
 * ```
 */
export const PqSocChart = defineDomainChart<Soc>({
  tag: "pq-soc-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapSocToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-soc-chart": InstanceType<typeof PqSocChart>;
  }
}
