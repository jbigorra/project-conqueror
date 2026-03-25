import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Revision } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapRevisionsToBar } from "../mappers/revisions.mapper";
import "../generic/ranked-bar";

type RevisionsVariant = "bar" | "treemap";

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
    // NOTE: treemap variant temporarily renders as bar until pq-treemap is implemented
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
