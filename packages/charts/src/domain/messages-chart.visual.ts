import type { MessageEntry } from "@prj-conq/behave";
import { html } from "lit";
import { mapMessagesToBar } from "../mappers/messages.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";

/**
 * Commit messages chart showing keyword match count per entity as a ranked bar.
 *
 * @element pq-messages-chart
 * @attr {MessageEntry[]} data - Inline message entry records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (default `20`).
 *
 * @example
 * ```html
 * <pq-messages-chart src="/api/analysis/messages" limit="10"></pq-messages-chart>
 * ```
 */
export const PqMessagesChart = defineDomainChart<MessageEntry>({
  tag: "pq-messages-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapMessagesToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-messages-chart": InstanceType<typeof PqMessagesChart>;
  }
}
