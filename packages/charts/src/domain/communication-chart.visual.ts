import type { Communication } from "@prj-conq/behave";
import { html } from "lit";
import { mapCommunicationToBar, mapCommunicationToBubble } from "../mappers/communication.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/bubble.visual";
import "../generic/ranked-bar.visual";

/**
 * Communication chart showing author-peer collaboration as bubble or bar.
 *
 * @element pq-communication-chart
 * @attr {Communication[]} data - Inline communication records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bubble"|"bar"} variant - Chart variant (default `"bubble"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-communication-chart src="/api/analysis/communication" variant="bubble"></pq-communication-chart>
 * ```
 */
export const PqCommunicationChart = defineDomainChart<Communication>({
  tag: "pq-communication-chart",
  defaultVariant: "bubble",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapCommunicationToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    bubble: (data, theme) =>
      html`<pq-bubble .data=${mapCommunicationToBubble(data)} .theme=${theme}></pq-bubble>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-communication-chart": InstanceType<typeof PqCommunicationChart>;
  }
}
