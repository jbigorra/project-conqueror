import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Fragmentation } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapFragmentationToBar, mapFragmentationToDoughnut } from "../mappers/fragmentation.mapper";
import "../generic/ranked-bar";
import "../generic/doughnut";

type FragmentationVariant = "bar" | "doughnut";

@customElement("pq-fragmentation-chart")
export class PqFragmentationChart extends LitElement {
  private fetcher = new DataFetchController<Fragmentation>(this);

  @property({ type: Array }) data?: Fragmentation[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: FragmentationVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Fragmentation[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "doughnut") {
      return html`<pq-doughnut
        .data=${mapFragmentationToDoughnut(this.resolvedData)}
        .theme=${this.theme}
      ></pq-doughnut>`;
    }
    return html`<pq-ranked-bar
      .data=${mapFragmentationToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-fragmentation-chart": PqFragmentationChart;
  }
}
