import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { binValues } from "../mappers/histogram.mapper";
import type { HistogramItem, ThemePreset } from "../types";

/**
 * Histogram chart web component backed by Chart.js.
 *
 * Accepts raw numeric values and bins them automatically.
 *
 * @element pq-histogram
 * @attr {HistogramItem[]} data - Inline data array of raw values.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} bins - Number of equal-width bins (default `10`).
 * @attr {string} x-label - Label for the X axis.
 * @attr {string} y-label - Label for the Y axis.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-histogram
 *   .data=${[{ value: 3 }, { value: 7 }, { value: 12 }]}
 *   bins="5"
 *   x-label="Age (months)"
 *   y-label="Files"
 * ></pq-histogram>
 * ```
 */
@customElement("pq-histogram")
export class PqHistogram extends LitElement {
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

  private fetcher = new DataFetchController<HistogramItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: HistogramItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) bins = 10;
  @property({ attribute: "x-label" }) xLabel = "";
  @property({ attribute: "y-label" }) yLabel = "";
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

    const values = resolved.map((item) => item.value);
    const binned = binValues(values, this.bins);

    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;

    this.chartCtrl.update({
      type: "bar",
      data: {
        labels: binned.map((b) => b.label),
        datasets: [
          {
            data: binned.map((b) => b.value),
            backgroundColor: this.themeCtrl.colors[0],
            borderColor: this.themeCtrl.colors[0],
            borderWidth: 1,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
        },
        scales: {
          ...themeScales,
          x: {
            ...themeScales.x,
            title: { display: !!this.xLabel, text: this.xLabel },
          },
          y: {
            ...themeScales.y,
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
    "pq-histogram": PqHistogram;
  }
}
