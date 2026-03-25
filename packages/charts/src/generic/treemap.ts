import type { ScriptableContext, TooltipItem } from "chart.js";
import type { TreemapDataPoint } from "chartjs-chart-treemap";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { ThemePreset, TreemapItem } from "../types";

@customElement("pq-treemap")
export class PqTreemap extends LitElement {
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

  private fetcher = new DataFetchController<TreemapItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: TreemapItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Boolean, attribute: "show-labels" }) showLabels = false;
  @property({ attribute: "color-field" }) colorField = "";
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
    const colors = this.themeCtrl.colors;

    // Build flat tree objects for chartjs-chart-treemap
    // Each item gets a label (last path segment) and value
    const treeData = resolved.map((item) => ({
      label: item.path[item.path.length - 1] ?? "",
      value: item.value,
      group: item.path.length > 1 ? item.path[0] : "root",
      ...(item.color !== undefined ? { colorIndex: item.color } : {}),
    }));

    this.chartCtrl.update({
      type: "treemap",
      data: {
        datasets: [
          {
            tree: treeData,
            key: "value",
            groups: ["group", "label"],
            data: [],
            backgroundColor: (ctx: ScriptableContext<"treemap">) => {
              const raw = ctx.raw as (TreemapDataPoint & { colorIndex?: number }) | undefined;
              if (!raw) return colors[0];
              // Use colorIndex if available, otherwise cycle through accent colors
              const idx =
                typeof raw.colorIndex === "number"
                  ? raw.colorIndex % colors.length
                  : ctx.dataIndex % colors.length;
              return colors[idx] ?? colors[0];
            },
            borderColor: this.themeCtrl.theme.border,
            borderWidth: 1,
            spacing: 2,
            labels: {
              display: this.showLabels,
              color: this.themeCtrl.theme.text,
              font: {
                family: this.themeCtrl.theme.fontFamily,
                size: parseInt(this.themeCtrl.theme.fontSize, 10),
              },
              formatter: (ctx: ScriptableContext<"treemap">) =>
                (ctx.raw as TreemapDataPoint | undefined)?.g ?? "",
            },
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
              label: (ctx: TooltipItem<"treemap">) => {
                const raw = ctx.raw as TreemapDataPoint | undefined;
                return `${raw?.g ?? ""}: ${raw?.v ?? ""}`;
              },
            },
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
    "pq-treemap": PqTreemap;
  }
}
