import type { TooltipItem } from "chart.js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { BubbleItem, ThemePreset } from "../types";

/**
 * Bubble chart web component backed by Chart.js.
 *
 * @element pq-bubble
 * @attr {BubbleItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {string} x-label - Label for the X axis.
 * @attr {string} y-label - Label for the Y axis.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bubble is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-bubble
 *   .data=${[{ label: "file.ts", x: 10, y: 5, r: 8 }]}
 *   theme="dark"
 *   x-label="Revisions"
 *   y-label="Complexity"
 * ></pq-bubble>
 * ```
 */
@customElement("pq-bubble")
export class PqBubble extends LitElement {
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

  private fetcher = new DataFetchController<BubbleItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: BubbleItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
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

    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;

    this.chartCtrl.update({
      type: "bubble",
      data: {
        datasets: [
          {
            data: resolved.map((item) => ({ x: item.x, y: item.y, r: item.r })),
            backgroundColor: this.themeCtrl.colors[0],
            borderColor: this.themeCtrl.colors[0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
          tooltip: {
            ...themePlugins.tooltip,
            callbacks: {
              label: (ctx: TooltipItem<"bubble">) => {
                const item = resolved[ctx.dataIndex];
                const label = item ? item.label : "";
                const raw = ctx.raw as { r?: number };
                return `${label}: (${ctx.parsed.x}, ${ctx.parsed.y}, r=${raw.r})`;
              },
            },
          },
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
    "pq-bubble": PqBubble;
  }
}
