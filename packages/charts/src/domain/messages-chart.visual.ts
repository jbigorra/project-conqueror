import type { MessageEntry } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapMessagesToBar } from "../mappers/messages.mapper";
import type { ThemePreset } from "../types";
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
@customElement("pq-messages-chart")
export class PqMessagesChart extends LitElement {
  private fetcher = new DataFetchController<MessageEntry>(this);

  @property({ type: Array }) data?: MessageEntry[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): MessageEntry[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    return html`<pq-ranked-bar
      .data=${mapMessagesToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-messages-chart": PqMessagesChart;
  }
}
