import type { Communication } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapCommunicationToBar, mapCommunicationToBubble } from "../mappers/communication.mapper";
import type { ThemePreset } from "../types";
import "../generic/bubble";
import "../generic/ranked-bar";

type CommunicationVariant = "bubble" | "bar";

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
@customElement("pq-communication-chart")
export class PqCommunicationChart extends LitElement {
  private fetcher = new DataFetchController<Communication>(this);

  @property({ type: Array }) data?: Communication[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: CommunicationVariant = "bubble";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Communication[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "bar") {
      return html`<pq-ranked-bar
        .data=${mapCommunicationToBar(this.resolvedData)}
        .limit=${this.limit}
        .theme=${this.theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`;
    }
    return html`<pq-bubble
      .data=${mapCommunicationToBubble(this.resolvedData)}
      .theme=${this.theme}
    ></pq-bubble>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-communication-chart": PqCommunicationChart;
  }
}
