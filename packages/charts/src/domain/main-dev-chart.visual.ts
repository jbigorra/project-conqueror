import type { MainDev } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapMainDevToBar, mapMainDevToTreemap } from "../mappers/main-dev.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar";
import "../generic/treemap";

type MainDevVariant = "bar" | "treemap";

/**
 * Main developer chart showing code ownership percentage as bar or treemap.
 *
 * @element pq-main-dev-chart
 * @attr {MainDev[]} data - Inline main developer records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-main-dev-chart src="/api/analysis/main-dev" variant="bar" limit="15"></pq-main-dev-chart>
 * ```
 */
@customElement("pq-main-dev-chart")
export class PqMainDevChart extends LitElement {
  private fetcher = new DataFetchController<MainDev>(this);

  @property({ type: Array }) data?: MainDev[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: MainDevVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): MainDev[] {
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
    "pq-main-dev-chart": PqMainDevChart;
  }
}
