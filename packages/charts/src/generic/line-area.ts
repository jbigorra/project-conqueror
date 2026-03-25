import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { buildLineAreaDatasets } from "../mappers/line-area.mapper";
import type { LineAreaPoint, ThemePreset } from "../types";

@customElement("pq-line-area")
export class PqLineArea extends LitElement {
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

  private fetcher = new DataFetchController<LineAreaPoint>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: LineAreaPoint[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Boolean }) fill = false;
  @property({ type: Boolean }) stacked = false;
  @property({ attribute: "x-label" }) xLabel = "";
  @property({ attribute: "y-label" }) yLabel = "";
  @property({ type: Boolean, attribute: "show-legend" }) showLegend = true;
  @property({ type: Boolean, attribute: "animated" }) animated = true;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("theme")) this.themeCtrl.update(this.theme);
    if (changed.has("animated")) this.chartCtrl.animate = this.animated;
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;

    const { labels, datasets } = buildLineAreaDatasets(resolved);

    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;

    this.chartCtrl.update({
      type: "line",
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: this.themeCtrl.colors[i % this.themeCtrl.colors.length],
          borderColor: this.themeCtrl.colors[i % this.themeCtrl.colors.length],
          fill: this.fill ? "origin" : false,
          tension: 0.3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: this.showLegend },
        },
        scales: {
          ...themeScales,
          x: {
            ...themeScales.x,
            stacked: this.stacked,
            title: { display: !!this.xLabel, text: this.xLabel },
          },
          y: {
            ...themeScales.y,
            stacked: this.stacked,
            title: { display: !!this.yLabel, text: this.yLabel },
          },
        },
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
    "pq-line-area": PqLineArea;
  }
}
