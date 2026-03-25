import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ComplexityHotspot } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapHotspotsToBubble, mapHotspotsToTreemap } from "../mappers/hotspots.mapper";
import "../generic/bubble";
import "../generic/treemap";

type HotspotsVariant = "bubble" | "treemap";

@customElement("pq-hotspots-chart")
export class PqHotspotsChart extends LitElement {
  private fetcher = new DataFetchController<ComplexityHotspot>(this);

  @property({ type: Array }) data?: ComplexityHotspot[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: HotspotsVariant = "bubble";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): ComplexityHotspot[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapHotspotsToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-bubble
      .data=${mapHotspotsToBubble(this.resolvedData)}
      .theme=${this.theme}
    ></pq-bubble>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-hotspots-chart": PqHotspotsChart;
  }
}
