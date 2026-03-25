import type { AuthorChurn } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapAuthorChurnToGrouped, mapAuthorChurnToStacked } from "../mappers/churn.mapper";
import type { ThemePreset } from "../types";
import "../generic/grouped-bar";
import "../generic/stacked-bar";

type AuthorChurnVariant = "grouped" | "stacked";

@customElement("pq-author-churn-chart")
export class PqAuthorChurnChart extends LitElement {
  private fetcher = new DataFetchController<AuthorChurn>(this);

  @property({ type: Array }) data?: AuthorChurn[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: AuthorChurnVariant = "grouped";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): AuthorChurn[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "stacked") {
      return html`<pq-stacked-bar
        .data=${mapAuthorChurnToStacked(this.resolvedData)}
        .theme=${this.theme}
      ></pq-stacked-bar>`;
    }
    return html`<pq-grouped-bar
      .data=${mapAuthorChurnToGrouped(this.resolvedData)}
      .theme=${this.theme}
    ></pq-grouped-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-author-churn-chart": PqAuthorChurnChart;
  }
}
