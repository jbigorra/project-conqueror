import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { AbsChurn } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapAbsChurnToLineArea } from "../mappers/churn.mapper";
import "../generic/line-area";

type AbsChurnVariant = "area" | "line";

@customElement("pq-abs-churn-chart")
export class PqAbsChurnChart extends LitElement {
  private fetcher = new DataFetchController<AbsChurn>(this);

  @property({ type: Array }) data?: AbsChurn[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: AbsChurnVariant = "area";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): AbsChurn[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    return html`<pq-line-area
      .data=${mapAbsChurnToLineArea(this.resolvedData)}
      .theme=${this.theme}
      .fill=${this.variant === "area"}
      show-legend
    ></pq-line-area>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-abs-churn-chart": PqAbsChurnChart;
  }
}
