import type { Chart } from "chart.js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { DoughnutItem, ThemePreset } from "../types";

@customElement("pq-doughnut")
export class PqDoughnut extends LitElement {
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

  private fetcher = new DataFetchController<DoughnutItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: DoughnutItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Boolean, attribute: "show-legend" }) showLegend = true;
  @property({ attribute: "center-label" }) centerLabel = "";
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

    const themePlugins = this.themeCtrl.options.plugins;
    const centerLabel = this.centerLabel;
    const themeText = this.themeCtrl.theme.text;
    const themeFontFamily = this.themeCtrl.theme.fontFamily;

    const centerLabelPlugin = centerLabel
      ? {
          id: "centerLabel",
          beforeDraw(chart: Chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.save();
            ctx.font = `bold 16px ${themeFontFamily}`;
            ctx.fillStyle = themeText;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(centerLabel, cx, cy);
            ctx.restore();
          },
        }
      : null;

    this.chartCtrl.update({
      type: "doughnut",
      data: {
        labels: resolved.map((d) => d.label),
        datasets: [
          {
            data: resolved.map((d) => d.value),
            backgroundColor: this.themeCtrl.colors.slice(0, resolved.length),
            borderColor: this.themeCtrl.colors.slice(0, resolved.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: this.showLegend },
          ...(centerLabelPlugin ? { centerLabel: centerLabelPlugin } : {}),
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
    "pq-doughnut": PqDoughnut;
  }
}
