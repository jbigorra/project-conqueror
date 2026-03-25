import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import type { RankedBarItem, SortDirection, ThemePreset } from "../types";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { sortItems, sliceItems } from "../mappers/ranked-bar.mapper";

@customElement("pq-ranked-bar")
export class PqRankedBar extends LitElement {
  static override styles = css`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
    .state-message {
      display: flex; align-items: center; justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  private fetcher = new DataFetchController<RankedBarItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: RankedBarItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) limit = 0;
  @property({ type: Boolean }) horizontal = true;
  @property() sort: SortDirection = "desc";
  @property({ type: Boolean, attribute: "animated" }) animated = true;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("theme")) this.themeCtrl.update(this.theme);
    if (changed.has("animated")) this.chartCtrl.animate = this.animated;
    if (changed.has("src") || changed.has("data")) await this.fetcher.fetch(this.src ?? "", !!this.data);
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;
    const sorted = sortItems(resolved, this.sort);
    const sliced = sliceItems(sorted, this.limit);
    const themePlugins = this.themeCtrl.options["plugins"] as object | undefined;
    const themeScales = this.themeCtrl.options["scales"] as object | undefined;
    this.chartCtrl.update({
      type: "bar",
      data: {
        labels: sliced.map((d) => d.label),
        datasets: [
          {
            data: sliced.map((d) => d.value),
            backgroundColor: this.themeCtrl.colors[0],
            borderColor: this.themeCtrl.colors[0],
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: this.horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          ...themePlugins,
        },
        scales: themeScales,
      },
    });
  }

  protected override render() {
    if (this.fetcher.state === "loading")
      return html`<div class="state-message"><slot name="loading">Loading…</slot></div>`;
    if (this.fetcher.state === "error")
      return html`<div class="state-message"><slot name="error">Failed to load data.</slot></div>`;
    const resolved = this.data ?? this.fetcher.data;
    if (resolved && resolved.length === 0)
      return html`<div class="state-message"><slot name="empty">No data.</slot></div>`;
    return html`<canvas ${ref(this.chartCtrl.canvasRef)}></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-ranked-bar": PqRankedBar;
  }
}
