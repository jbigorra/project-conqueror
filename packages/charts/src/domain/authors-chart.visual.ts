import type { Author } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapAuthorsToBar, mapAuthorsToTreemap } from "../mappers/authors.mapper";
import type { ThemePreset } from "../types";
import "../generic/ranked-bar";
import "../generic/treemap";

type AuthorsVariant = "bar" | "treemap";

/**
 * Authors chart showing author count per entity as bar or treemap.
 *
 * @element pq-authors-chart
 * @attr {Author[]} data - Inline author records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-authors-chart src="/api/analysis/authors" variant="bar" limit="15"></pq-authors-chart>
 * ```
 */
@customElement("pq-authors-chart")
export class PqAuthorsChart extends LitElement {
  private fetcher = new DataFetchController<Author>(this);

  @property({ type: Array }) data?: Author[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: AuthorsVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Author[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapAuthorsToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-ranked-bar
      .data=${mapAuthorsToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-authors-chart": PqAuthorsChart;
  }
}
