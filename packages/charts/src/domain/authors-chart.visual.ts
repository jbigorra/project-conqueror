import type { Author } from "@prj-conq/behave";
import { html } from "lit";
import { mapAuthorsToBar, mapAuthorsToTreemap } from "../mappers/authors.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

/**
 * Authors chart showing author count per entity as bar or treemap.
 *
 * @element pq-authors-chart
 * @attr {Author[]} data - Inline author records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-authors-chart src="/api/analysis/authors" variant="bar" limit="15"></pq-authors-chart>
 * ```
 */
export const PqAuthorsChart = defineDomainChart<Author>({
  tag: "pq-authors-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapAuthorsToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    treemap: (data, theme) =>
      html`<pq-treemap .data=${mapAuthorsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-authors-chart": InstanceType<typeof PqAuthorsChart>;
  }
}
