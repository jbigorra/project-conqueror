import type { Coupling } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapCouplingToBar, mapCouplingToBubble } from "../mappers/coupling.mapper";
import type { ThemePreset } from "../types";
import "../generic/bubble";
import "../generic/ranked-bar";

type CouplingVariant = "bubble" | "bar";

@customElement("pq-coupling-chart")
export class PqCouplingChart extends LitElement {
  private fetcher = new DataFetchController<Coupling>(this);

  @property({ type: Array }) data?: Coupling[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: CouplingVariant = "bubble";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Coupling[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "bar") {
      return html`<pq-ranked-bar
        .data=${mapCouplingToBar(this.resolvedData)}
        .limit=${this.limit}
        .theme=${this.theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`;
    }
    return html`<pq-bubble
      .data=${mapCouplingToBubble(this.resolvedData)}
      .theme=${this.theme}
    ></pq-bubble>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-coupling-chart": PqCouplingChart;
  }
}
