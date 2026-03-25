import type { RefactoringMainDev } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapRefactoringDevToBar, mapRefactoringDevToTreemap } from "../mappers/main-dev.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar";
import "../generic/treemap";

type RefactoringDevVariant = "bar" | "treemap";

@customElement("pq-refactoring-dev-chart")
export class PqRefactoringDevChart extends LitElement {
  private fetcher = new DataFetchController<RefactoringMainDev>(this);

  @property({ type: Array }) data?: RefactoringMainDev[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: RefactoringDevVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): RefactoringMainDev[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapRefactoringDevToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-ranked-bar
      .data=${mapRefactoringDevToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-refactoring-dev-chart": PqRefactoringDevChart;
  }
}
