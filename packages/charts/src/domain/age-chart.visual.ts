import type { CodeAge } from "@prj-conq/behave";
import { html } from "lit";
import { mapAgeToBar, mapAgeToHistogram } from "../mappers/age.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/histogram.visual";
import "../generic/ranked-bar.visual";

/**
 * Code age chart showing file age distribution as histogram or ranked bar.
 *
 * @element pq-age-chart
 * @attr {CodeAge[]} data - Inline code age records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"histogram"|"bar"} variant - Chart variant (default `"histogram"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 * @attr {number} bins - Number of histogram bins (default `10`).
 *
 * @example
 * ```html
 * <pq-age-chart src="/api/analysis/age" variant="histogram" bins="8"></pq-age-chart>
 * ```
 */
export const PqAgeChart = defineDomainChart<CodeAge, { bins: number }>({
  tag: "pq-age-chart",
  defaultVariant: "histogram",
  properties: { bins: { type: Number } },
  defaults: { bins: 10 },
  variants: {
    histogram: (data, theme, _limit, extra) =>
      html`<pq-histogram
        .data=${mapAgeToHistogram(data).map((v) => ({ value: v }))}
        .bins=${extra?.bins ?? 10}
        .theme=${theme}
        x-label="Age (months)"
        y-label="Files"
      ></pq-histogram>`,
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapAgeToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-age-chart": InstanceType<typeof PqAgeChart>;
  }
}
