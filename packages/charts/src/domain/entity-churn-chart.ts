import type { EntityChurn } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapEntityChurnToGrouped, mapEntityChurnToStacked } from "../mappers/churn.mapper";
import type { ThemePreset } from "../types";
import "../generic/grouped-bar";
import "../generic/stacked-bar";

type EntityChurnVariant = "grouped" | "stacked";

@customElement("pq-entity-churn-chart")
export class PqEntityChurnChart extends LitElement {
  private fetcher = new DataFetchController<EntityChurn>(this);

  @property({ type: Array }) data?: EntityChurn[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: EntityChurnVariant = "grouped";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): EntityChurn[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "stacked") {
      return html`<pq-stacked-bar
        .data=${mapEntityChurnToStacked(this.resolvedData)}
        .theme=${this.theme}
      ></pq-stacked-bar>`;
    }
    return html`<pq-grouped-bar
      .data=${mapEntityChurnToGrouped(this.resolvedData)}
      .theme=${this.theme}
    ></pq-grouped-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-entity-churn-chart": PqEntityChurnChart;
  }
}
