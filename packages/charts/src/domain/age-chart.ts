import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CodeAge } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapAgeToHistogram, mapAgeToBar } from "../mappers/age.mapper";
import "../generic/histogram";
import "../generic/ranked-bar";

type AgeVariant = "histogram" | "bar";

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
