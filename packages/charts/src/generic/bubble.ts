import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import type { BubbleItem, ThemePreset } from "../types";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";

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
    if (changed.has("src") || changed.has("data")) await this.fetcher.fetch(this.src ?? "", !!this.data);
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;

    const themePlugins = this.themeCtrl.options["plugins"] as object | undefined;
    const themeScales = this.themeCtrl.options["scales"] as object | undefined;

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
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const item = resolved[ctx.dataIndex];
                const label = item ? item.label : "";
                return `${label}: (${ctx.parsed.x}, ${ctx.parsed.y}, r=${(ctx.raw as any).r})`;
              },
            },
          },
          ...themePlugins,
        },
        scales: {
          ...(themeScales as object),
          x: {
            ...((themeScales as any)?.x ?? {}),
            title: { display: !!this.xLabel, text: this.xLabel },
          },
          y: {
            ...((themeScales as any)?.y ?? {}),
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
