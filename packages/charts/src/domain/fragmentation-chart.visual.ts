import type { Fragmentation } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapFragmentationToBar, mapFragmentationToDoughnut } from "../mappers/fragmentation.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar.visual";
import "../generic/doughnut.visual";

type FragmentationVariant = "bar" | "doughnut";

/**
 * Fragmentation chart showing knowledge fragmentation (fractal value) as bar or doughnut.
 *
 * @element pq-fragmentation-chart
 * @attr {Fragmentation[]} data - Inline fragmentation records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"doughnut"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-fragmentation-chart src="/api/analysis/fragmentation" variant="bar" limit="15"></pq-fragmentation-chart>
 * ```
 */
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
