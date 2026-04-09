import type { EntityOwnership } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapOwnershipToDoughnut, mapOwnershipToStacked } from "../mappers/ownership.mapper";
import type { ThemePreset } from "../types";
import "../generic/stacked-bar.visual";
import "../generic/doughnut.visual";

type OwnershipVariant = "stacked" | "doughnut";

/**
 * Entity ownership chart showing author contributions as stacked bar or doughnut.
 *
 * @element pq-ownership-chart
 * @attr {EntityOwnership[]} data - Inline entity ownership records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"stacked"|"doughnut"} variant - Chart variant (default `"stacked"`).
 * @attr {string} entity - Entity path to filter for the doughnut variant.
 *
 * @example
 * ```html
 * <pq-ownership-chart src="/api/analysis/ownership" variant="stacked"></pq-ownership-chart>
 * ```
 */
@customElement("pq-ownership-chart")
export class PqOwnershipChart extends LitElement {
  private fetcher = new DataFetchController<EntityOwnership>(this);

  @property({ type: Array }) data?: EntityOwnership[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: OwnershipVariant = "stacked";
  @property() entity = "";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): EntityOwnership[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "doughnut") {
      return html`<pq-doughnut
        .data=${mapOwnershipToDoughnut(this.resolvedData, this.entity)}
        .theme=${this.theme}
      ></pq-doughnut>`;
    }
    return html`<pq-stacked-bar
      .data=${mapOwnershipToStacked(this.resolvedData)}
      .theme=${this.theme}
    ></pq-stacked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-ownership-chart": PqOwnershipChart;
  }
}
