import type { EntityEffort } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapEffortToDoughnut, mapEffortToStacked } from "../mappers/effort.mapper";
import type { ThemePreset } from "../types";
import "../generic/stacked-bar";
import "../generic/doughnut";

type EffortVariant = "stacked" | "doughnut";

/**
 * Effort chart showing author contributions per entity as stacked bar or doughnut.
 *
 * @element pq-effort-chart
 * @attr {EntityEffort[]} data - Inline entity effort records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"stacked"|"doughnut"} variant - Chart variant (default `"stacked"`).
 * @attr {string} entity - Entity path to filter for the doughnut variant.
 *
 * @example
 * ```html
 * <pq-effort-chart src="/api/analysis/effort" variant="stacked"></pq-effort-chart>
 * ```
 */
@customElement("pq-effort-chart")
export class PqEffortChart extends LitElement {
  private fetcher = new DataFetchController<EntityEffort>(this);

  @property({ type: Array }) data?: EntityEffort[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: EffortVariant = "stacked";
  @property() entity = "";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): EntityEffort[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "doughnut") {
      return html`<pq-doughnut
        .data=${mapEffortToDoughnut(this.resolvedData, this.entity)}
        .theme=${this.theme}
      ></pq-doughnut>`;
    }
    return html`<pq-stacked-bar
      .data=${mapEffortToStacked(this.resolvedData)}
      .theme=${this.theme}
    ></pq-stacked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-effort-chart": PqEffortChart;
  }
}
