import type { Soc } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapSocToBar } from "../mappers/soc.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar";

/**
 * Sum-of-coupling (SOC) chart showing coupling scores as a ranked bar.
 *
 * @element pq-soc-chart
 * @attr {Soc[]} data - Inline SOC records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (default `20`).
 *
 * @example
 * ```html
 * <pq-soc-chart src="/api/analysis/soc" limit="15"></pq-soc-chart>
 * ```
 */
@customElement("pq-soc-chart")
export class PqSocChart extends LitElement {
  private fetcher = new DataFetchController<Soc>(this);

  @property({ type: Array }) data?: Soc[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Soc[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    return html`<pq-ranked-bar
      .data=${mapSocToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-soc-chart": PqSocChart;
  }
}
