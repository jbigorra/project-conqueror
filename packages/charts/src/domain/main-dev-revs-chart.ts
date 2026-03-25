import type { MainDevByRevs } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapMainDevToBar, mapMainDevToTreemap } from "../mappers/main-dev.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar";
import "../generic/treemap";

type MainDevRevsVariant = "bar" | "treemap";

@customElement("pq-main-dev-revs-chart")
export class PqMainDevRevsChart extends LitElement {
  private fetcher = new DataFetchController<MainDevByRevs>(this);

  @property({ type: Array }) data?: MainDevByRevs[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: MainDevRevsVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): MainDevByRevs[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapMainDevToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-ranked-bar
      .data=${mapMainDevToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-main-dev-revs-chart": PqMainDevRevsChart;
  }
}
