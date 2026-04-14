import type { Coupling } from "@prj-conq/behave";
import { html } from "lit";
import { mapCouplingToBar, mapCouplingToBubble } from "../mappers/coupling.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/bubble.visual";
import "../generic/ranked-bar.visual";

/**
 * Coupling chart showing temporal coupling between entities as bubble or bar.
 *
 * @element pq-coupling-chart
 * @attr {Coupling[]} data - Inline coupling records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bubble"|"bar"} variant - Chart variant (default `"bubble"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-coupling-chart src="/api/analysis/coupling" variant="bubble"></pq-coupling-chart>
 * ```
 */
export const PqCouplingChart = defineDomainChart<Coupling>({
  tag: "pq-coupling-chart",
  defaultVariant: "bubble",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapCouplingToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    bubble: (data, theme) =>
      html`<pq-bubble .data=${mapCouplingToBubble(data)} .theme=${theme}></pq-bubble>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-coupling-chart": InstanceType<typeof PqCouplingChart>;
  }
}
