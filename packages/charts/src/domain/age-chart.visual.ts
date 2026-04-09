import type { CodeAge } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapAgeToBar, mapAgeToHistogram } from "../mappers/age.mapper";
import type { ThemePreset } from "../types";
import "../generic/histogram";
import "../generic/ranked-bar";

type AgeVariant = "histogram" | "bar";

/**
 * Code age chart showing file age distribution as histogram or ranked bar.
 *
 * @element pq-age-chart
 * @attr {CodeAge[]} data - Inline code age records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"histogram"|"bar"} variant - Chart variant (default `"histogram"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 * @attr {number} bins - Number of histogram bins (default `10`).
 *
 * @example
 * ```html
 * <pq-age-chart src="/api/analysis/age" variant="histogram" bins="8"></pq-age-chart>
 * ```
 */
@customElement("pq-age-chart")
export class PqAgeChart extends LitElement {
  private fetcher = new DataFetchController<CodeAge>(this);

  @property({ type: Array }) data?: CodeAge[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: AgeVariant = "histogram";
  @property({ type: Number }) limit = 20;
  @property({ type: Number }) bins = 10;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): CodeAge[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "bar") {
      return html`<pq-ranked-bar
        .data=${mapAgeToBar(this.resolvedData)}
        .limit=${this.limit}
        .theme=${this.theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`;
    }
    return html`<pq-histogram
      .data=${mapAgeToHistogram(this.resolvedData).map((v) => ({ value: v }))}
      .bins=${this.bins}
      .theme=${this.theme}
      x-label="Age (months)"
      y-label="Files"
    ></pq-histogram>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-age-chart": PqAgeChart;
  }
}
