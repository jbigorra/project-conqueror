import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { sliceItems, sortItems } from "../mappers/ranked-bar.mapper";
import type { RankedBarItem, SortDirection, ThemePreset } from "../types";

/**
 * Ranked bar chart web component backed by Chart.js.
 *
 * Automatically sorts and slices data. Ideal for top-N rankings.
 *
 * @element pq-ranked-bar
 * @attr {RankedBarItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (0 = unlimited).
 * @attr {boolean} horizontal - Render bars horizontally (default `true`).
 * @attr {"asc"|"desc"|"none"} sort - Sort direction (default `"desc"`).
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-ranked-bar
 *   .data=${[{ label: "src/index.ts", value: 42 }, { label: "src/app.ts", value: 18 }]}
 *   limit="10"
 *   sort="desc"
 *   horizontal
 * ></pq-ranked-bar>
 * ```
 */
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
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;
    const sorted = sortItems(resolved, this.sort);
    const sliced = sliceItems(sorted, this.limit);
    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;
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
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
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
