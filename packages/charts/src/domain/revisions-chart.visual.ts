import type { Revision } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../mappers/revisions.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

type RevisionsVariant = "bar" | "treemap";

/**
 * Revisions chart showing file revision count as ranked bar or treemap.
 *
 * @element pq-revisions-chart
 * @attr {Revision[]} data - Inline revision records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-revisions-chart src="/api/analysis/revisions" variant="treemap"></pq-revisions-chart>
 * ```
 */
@customElement("pq-revisions-chart")
export class PqRevisionsChart extends LitElement {
  private fetcher = new DataFetchController<Revision>(this);

  @property({ type: Array }) data?: Revision[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: RevisionsVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Revision[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapRevisionsToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-ranked-bar
      .data=${mapRevisionsToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-revisions-chart": PqRevisionsChart;
  }
}
