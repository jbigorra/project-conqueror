import type { Coupling } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapCouplingToBar, mapCouplingToBubble } from "../mappers/coupling.mapper";
import type { ThemePreset } from "../types";
import "../generic/bubble.visual";
import "../generic/ranked-bar.visual";

type CouplingVariant = "bubble" | "bar";

/**
 * Coupling chart showing temporal coupling between entities as bubble or bar.
 *
 * @element pq-coupling-chart
 * @attr {Coupling[]} data - Inline coupling records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bubble"|"bar"} variant - Chart variant (default `"bubble"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-coupling-chart src="/api/analysis/coupling" variant="bubble"></pq-coupling-chart>
 * ```
 */
@customElement("pq-coupling-chart")
export class PqCouplingChart extends LitElement {
  private fetcher = new DataFetchController<Coupling>(this);

  @property({ type: Array }) data?: Coupling[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: CouplingVariant = "bubble";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): Coupling[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "bar") {
      return html`<pq-ranked-bar
        .data=${mapCouplingToBar(this.resolvedData)}
        .limit=${this.limit}
        .theme=${this.theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`;
    }
    return html`<pq-bubble
      .data=${mapCouplingToBubble(this.resolvedData)}
      .theme=${this.theme}
    ></pq-bubble>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-coupling-chart": PqCouplingChart;
  }
}
