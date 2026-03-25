import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { MessageEntry } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapMessagesToBar } from "../mappers/messages.mapper";
import "../generic/ranked-bar";

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
