import type { ComplexityHotspot } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapHotspotsToBubble, mapHotspotsToTreemap } from "../mappers/hotspots.mapper";
import { mapHotspotsToEnclosure } from "../mappers/hotspots-enclosure.mapper";
import type { ThemePreset } from "../types";
import "../generic/bubble";
import "../generic/treemap";
import "../generic/enclosure";

type HotspotsVariant = "bubble" | "treemap" | "enclosure";

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
    if (this.variant === "enclosure") {
      return html`<pq-enclosure .data=${mapHotspotsToEnclosure(this.resolvedData)}></pq-enclosure>`;
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
