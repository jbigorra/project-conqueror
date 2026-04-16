import type { ChartConfiguration } from "chart.js";
import { css, html, LitElement } from "lit";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { ThemePreset } from "../types";

/**
 * Contextual object passed to the `buildConfig` strategy function.
 * Contains resolved data, all three controllers, and a snapshot of
 * the component instance for reading custom properties.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 */
export type BuildConfigContext<T, Props extends Record<string, unknown>> = {
  /** Resolved non-empty data array (inline `data` prop or fetched via `src`). */
  resolved: T[];
  /** Provides `colors`, `theme`, and `options` (scales + plugins) for Chart.js config. */
  themeCtrl: ThemeController;
  /** Provides `animate` flag; rarely needed in buildConfig but available. */
  chartCtrl: ChartController;
  /** Current values of all component-specific properties. */
  props: Props;
};

/**
 * Strategy function that builds a Chart.js configuration from resolved data.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 * @param ctx - Context with resolved data, controllers, and component props.
 * @returns A complete Chart.js `ChartConfiguration` object.
 */
export type BuildConfigFn<T, Props extends Record<string, unknown>> = (
  ctx: BuildConfigContext<T, Props>,
) => ChartConfiguration;

/**
 * Lit `PropertyDeclaration`-compatible descriptor for a single reactive property.
 * Matches the shape accepted by Lit's `static properties` map.
 *
 * @example
 * ```ts
 * const decl: LitPropertyDeclaration = { type: Number };
 * const decl2: LitPropertyDeclaration = { attribute: "x-label" };
 * ```
 */
export type LitPropertyDeclaration = {
  type?: typeof Boolean | typeof Number | typeof String | typeof Array | typeof Object;
  attribute?: string | boolean;
  reflect?: boolean;
  converter?:
    | ((value: string | null, type?: unknown) => unknown)
    | {
        fromAttribute?: (v: string | null, t?: unknown) => unknown;
        toAttribute?: (v: unknown, t?: unknown) => unknown;
      };
  hasChanged?: (value: unknown, oldValue: unknown) => boolean;
  state?: boolean;
  noAccessor?: boolean;
  useDefault?: boolean;
};

/**
 * Configuration object passed to {@link defineGenericChart}.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 *
 * @example
 * ```ts
 * const config: GenericChartConfig<BubbleItem, { xLabel: string; yLabel: string }> = {
 *   tag: "pq-bubble",
 *   properties: {
 *     xLabel: { attribute: "x-label" },
 *     yLabel: { attribute: "y-label" },
 *   },
 *   defaults: { xLabel: "", yLabel: "" },
 *   buildConfig: ({ resolved, themeCtrl, props }) => ({ type: "bubble", data: {}, options: {} }),
 * };
 * ```
 */
export type GenericChartConfig<T, Props extends Record<string, unknown> = Record<string, never>> = {
  /**
   * Custom element tag name (e.g. `"pq-bubble"`).
   * Must match the existing registered tag name — not changing it.
   */
  tag: string;

  /**
   * Component-specific reactive properties, declared using Lit's `static properties` map format.
   * Do NOT include `data`, `src`, `theme`, or `animated` — these are injected by the factory.
   *
   * @example
   * ```ts
   * properties: {
   *   limit: { type: Number },
   *   horizontal: { type: Boolean },
   *   sort: {},  // string, no type coercion
   * }
   * ```
   */
  properties: Record<string, LitPropertyDeclaration> & {
    [K in keyof Props]?: LitPropertyDeclaration;
  };

  /**
   * Default values for each component-specific property.
   * Every key in `properties` MUST have a corresponding default here.
   *
   * @example
   * ```ts
   * defaults: { limit: 0, horizontal: true, sort: "desc" }
   * ```
   */
  defaults: Props;

  /**
   * Strategy function that builds the Chart.js configuration.
   * Called only when resolved data is non-empty.
   *
   * @param ctx - Contains resolved data, controllers, and component props.
   * @returns Chart.js `ChartConfiguration` object.
   */
  buildConfig: BuildConfigFn<T, Props>;
};

/**
 * Factory that creates and registers a Chart.js-backed Lit Web Component.
 *
 * All shared infrastructure (styles, controllers, base properties, lifecycle,
 * render states) is handled by the factory. Consumers supply only their
 * component-specific properties and a `buildConfig` strategy function.
 *
 * No class inheritance. No abstract methods. Composition only.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 * @param config - Component configuration: tag, properties, defaults, buildConfig strategy.
 * @returns The generated Lit element class (use for `HTMLElementTagNameMap` augmentation).
 *
 * @example
 * ```ts
 * export const PqBubble = defineGenericChart<BubbleItem, { xLabel: string; yLabel: string }>({
 *   tag: "pq-bubble",
 *   properties: {
 *     xLabel: { attribute: "x-label" },
 *     yLabel: { attribute: "y-label" },
 *   },
 *   defaults: { xLabel: "", yLabel: "" },
 *   buildConfig: ({ resolved, themeCtrl, props }) => ({ type: "bubble", data: {}, options: {} }),
 * });
 * ```
 */
export function defineGenericChart<
  T,
  Props extends Record<string, unknown> = Record<string, never>,
>(config: GenericChartConfig<T, Props>): typeof LitElement {
  const sharedStyles = css`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
    .state-message {
      display: flex; align-items: center; justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  class GenericChart extends LitElement {
    static override styles = sharedStyles;

    static override properties = {
      data: { type: Array },
      src: {},
      theme: {},
      animated: { type: Boolean, attribute: "animated" },
      ...config.properties,
    };

    private fetcher = new DataFetchController<T>(this);
    private chartCtrl = new ChartController(this);
    private themeCtrl = new ThemeController(this);

    data?: T[];
    src?: string;
    theme?: ThemePreset;
    animated = true;

    constructor() {
      super();
      for (const [key, value] of Object.entries(config.defaults)) {
        (this as unknown as Record<string, unknown>)[key] = value;
      }
    }

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

      const props = Object.fromEntries(
        Object.keys(config.properties).map((key) => [
          key,
          (this as unknown as Record<string, unknown>)[key],
        ]),
      ) as Props;

      const chartConfig = config.buildConfig({
        resolved,
        themeCtrl: this.themeCtrl,
        chartCtrl: this.chartCtrl,
        props,
      });

      this.chartCtrl.update(chartConfig);
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

  if (!customElements.get(config.tag)) {
    customElements.define(config.tag, GenericChart);
  }
  return GenericChart;
}
