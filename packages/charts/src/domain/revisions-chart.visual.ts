import type { Revision } from "@prj-conq/behave";
import { html } from "lit";
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../mappers/revisions.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

/**
 * Revisions chart showing file revision count as ranked bar or treemap.
 *
 * @element pq-revisions-chart
 * @attr {Revision[]} data - Inline revision records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-revisions-chart src="/api/analysis/revisions" variant="treemap"></pq-revisions-chart>
 * ```
 */
export const PqRevisionsChart = defineDomainChart<Revision>({
  tag: "pq-revisions-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapRevisionsToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    treemap: (data, theme) =>
      html`<pq-treemap .data=${mapRevisionsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-revisions-chart": InstanceType<typeof PqRevisionsChart>;
  }
}
