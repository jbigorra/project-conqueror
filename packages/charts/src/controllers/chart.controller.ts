import "../chart-setup";
import { Chart, type ChartConfiguration, type ChartType } from "chart.js";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { createRef, type Ref } from "lit/directives/ref.js";

/**
 * Lit reactive controller that manages a Chart.js instance lifecycle.
 *
 * Handles chart creation, updates, resize observation, and click events.
 * Attach to a Lit host element and call {@link update} from `updated()`.
 *
 * @example
 * ```ts
 * class MyChart extends LitElement {
 *   private chartCtrl = new ChartController(this);
 *   protected override render() {
 *     return html`<canvas ${ref(this.chartCtrl.canvasRef)}></canvas>`;
 *   }
 * }
 * ```
 */
export class ChartController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private chart?: Chart;
  private chartCanvas?: HTMLCanvasElement;
  private resizeObserver?: ResizeObserver;
  private _animate = true;

  /** Lit ref to bind to the `<canvas>` element in the host's template. */
  canvasRef: Ref<HTMLCanvasElement> = createRef();

  /**
   * @param host - Lit element that owns this controller.
   */
  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  /** Toggle chart animations on or off. */
  set animate(value: boolean) {
    this._animate = value;
  }

  hostConnected(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.resizeObserver.observe(this.host);
  }

  hostDisconnected(): void {
    this.resizeObserver?.disconnect();
    this.chart?.destroy();
    this.chart = undefined;
  }

  /**
   * Create or update the Chart.js instance with the given configuration.
   *
   * If the canvas ref changed (Lit re-rendered), the old chart is destroyed
   * and a new one is created. Dispatches `chart-click` custom events on click.
   *
   * @param config - Full Chart.js configuration (type, data, options).
   */
  update<T extends ChartType>(config: ChartConfiguration<T>): void {
    const canvas = this.canvasRef.value;
    if (!canvas) return;

    const cfg = config as ChartConfiguration;

    if (!this._animate) {
      cfg.options = { ...cfg.options, animation: false };
    }

    cfg.options = {
      ...cfg.options,
      onClick: (
        _event: unknown,
        elements: Array<{ datasetIndex: number; index: number }>,
        chart: Chart,
      ) => {
        if (elements.length > 0) {
          const element = elements[0];
          if (!element) return;
          const datasetIndex = element.datasetIndex;
          const index = element.index;
          const dataset = chart.data.datasets[datasetIndex];
          if (!dataset) return;
          const label = chart.data.labels?.[index];
          const value = dataset.data[index];
          this.host.dispatchEvent(
            new CustomEvent("chart-click", {
              bubbles: true,
              composed: true,
              detail: { datasetIndex, index, label, value },
            }),
          );
        }
      },
    };

    // If the canvas element changed (Lit re-rendered), destroy the old chart
    if (this.chart && this.chartCanvas !== canvas) {
      this.chart.destroy();
      this.chart = undefined;
    }

    if (this.chart) {
      this.chart.data = cfg.data;
      if (cfg.options) Object.assign(this.chart.options, cfg.options);
      this.chart.update(this._animate ? undefined : "none");
    } else {
      this.chart = new Chart(canvas, cfg);
      this.chartCanvas = canvas;
    }
  }
}
