import type { TemplateResult } from "lit";
import { LitElement } from "lit";
import { DataFetchController } from "../controllers/data-fetch.controller";
import type { ThemePreset } from "../types";

/**
 * Strategy function that renders a specific chart variant from domain data.
 *
 * Receives the resolved data array, the current theme preset, the
 * configured item limit, and any extra consumer-declared properties.
 * Returns a Lit `TemplateResult` delegating to the appropriate generic chart component.
 *
 * The 4th parameter `extra` is required in the type signature but TypeScript
 * callback compatibility means existing 3-param renderers remain assignable.
 *
 * @typeParam T - The domain data item type this variant renders.
 * @typeParam P - Record of extra consumer-declared properties.
 * @param data - Resolved non-empty data array (inline prop or fetched).
 * @param theme - Current theme preset (may be undefined).
 * @param limit - Maximum number of items to display (default `20`).
 * @param extra - Current values of all extra consumer-declared properties.
 * @returns A Lit `TemplateResult` wrapping the target generic chart.
 *
 * @example
 * ```ts
 * const barRenderer: VariantRenderer<Revision> = (data, theme, limit) =>
 *   html`<pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit} .theme=${theme}></pq-ranked-bar>`;
 * ```
 *
 * @example
 * ```ts
 * const histRenderer: VariantRenderer<CodeAge, { bins: number }> = (data, theme, limit, { bins }) =>
 *   html`<pq-histogram .data=${mapAgeToHistogram(data).map(v => ({ value: v }))} .bins=${bins} .theme=${theme}></pq-histogram>`;
 * ```
 */
export type VariantRenderer<T, P extends Record<string, unknown> = Record<string, never>> = (
  data: T[],
  theme?: ThemePreset,
  limit?: number,
  extra?: P,
) => TemplateResult;

/**
 * Configuration object passed to {@link defineDomainChart}.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam P - Record of extra consumer-declared properties (e.g. `{ bins: number }`).
 *
 * @example
 * ```ts
 * const config: DomainChartConfig<Revision> = {
 *   tag: "pq-revisions-chart",
 *   defaultVariant: "bar",
 *   variants: {
 *     bar: (data, theme, limit) => html`<pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit} .theme=${theme} sort="desc" horizontal></pq-ranked-bar>`,
 *     treemap: (data, theme) => html`<pq-treemap .data=${mapRevisionsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
 *   },
 * };
 * ```
 *
 * @example
 * ```ts
 * const config: DomainChartConfig<CodeAge, { bins: number }> = {
 *   tag: "pq-age-chart",
 *   defaultVariant: "histogram",
 *   properties: { bins: { type: Number } },
 *   defaults: { bins: 10 },
 *   variants: {
 *     histogram: (data, theme, limit, { bins }) =>
 *       html`<pq-histogram .data=${mapAgeToHistogram(data).map(v => ({ value: v }))} .bins=${bins} .theme=${theme}></pq-histogram>`,
 *   },
 * };
 * ```
 */
export type DomainChartConfig<T, P extends Record<string, unknown> = Record<string, never>> = {
  /**
   * Custom element tag name (e.g. `"pq-revisions-chart"`).
   * Must be a valid custom element name (hyphenated, lowercase).
   */
  tag: string;

  /**
   * The variant key to use when no `variant` attribute is provided.
   * Must match one of the keys in `variants`.
   */
  defaultVariant: string;

  /**
   * Map of variant name to renderer function.
   * Each renderer receives the resolved data, current theme, limit, and extra props,
   * and returns a Lit `TemplateResult` delegating to a generic chart component.
   */
  variants: Record<string, VariantRenderer<T, P>>;

  /**
   * Default maximum number of items to show in ranked/bar variants.
   * Defaults to `20` when omitted.
   */
  limit?: number;

  /**
   * Extra consumer-declared reactive properties, declared using Lit's `static properties` map format.
   * Do NOT include `data`, `src`, `theme`, `variant`, or `limit` — these are injected by the factory.
   *
   * @example
   * ```ts
   * properties: { bins: { type: Number } }
   * ```
   */
  properties?: Record<string, unknown>;

  /**
   * Default values for each extra consumer-declared property.
   * Every key in `properties` SHOULD have a corresponding default here.
   * These values are set on the instance during construction.
   *
   * @example
   * ```ts
   * defaults: { bins: 10 }
   * ```
   */
  defaults?: P;
};

/**
 * Factory that creates and registers a domain-specific Lit Web Component.
 *
 * All shared infrastructure (`DataFetchController`, base properties, lifecycle,
 * `resolvedData` getter) is handled by the factory. Consumers supply only
 * the data type, available variants (as renderer functions), the default variant,
 * and any extra consumer-declared properties.
 *
 * No class inheritance. No abstract methods. Composition only.
 *
 * **Backward compatible**: existing calls to `defineDomainChart<T>()` with no
 * second type parameter continue to work without any changes.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam P - Record of extra consumer-declared properties (default: `Record<string, never>`).
 * @param config - Component configuration: tag, defaultVariant, variants map, optional limit, optional properties/defaults.
 * @returns The generated Lit element class (use for `HTMLElementTagNameMap` augmentation).
 *
 * @example
 * ```ts
 * export const PqRevisionsChart = defineDomainChart<Revision>({
 *   tag: "pq-revisions-chart",
 *   defaultVariant: "bar",
 *   variants: {
 *     bar: (data, theme, limit) =>
 *       html`<pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit} .theme=${theme} sort="desc" horizontal></pq-ranked-bar>`,
 *     treemap: (data, theme) =>
 *       html`<pq-treemap .data=${mapRevisionsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * export const PqAgeChart = defineDomainChart<CodeAge, { bins: number }>({
 *   tag: "pq-age-chart",
 *   defaultVariant: "histogram",
 *   properties: { bins: { type: Number } },
 *   defaults: { bins: 10 },
 *   variants: {
 *     histogram: (data, theme, limit, { bins }) =>
 *       html`<pq-histogram .data=${mapAgeToHistogram(data).map(v => ({ value: v }))} .bins=${bins} .theme=${theme}></pq-histogram>`,
 *   },
 * });
 * ```
 */
export function defineDomainChart<T, P extends Record<string, unknown> = Record<string, never>>(
  config: DomainChartConfig<T, P>,
): typeof LitElement {
  class DomainChart extends LitElement {
    static override readonly properties = {
      data: { type: Array },
      src: {},
      theme: {},
      variant: {},
      limit: { type: Number },
      ...config.properties,
    };

    private readonly fetcher = new DataFetchController<T>(this);

    data?: T[];
    src?: string;
    theme?: ThemePreset;
    variant: string = config.defaultVariant;
    limit: number = config.limit ?? 20;

    constructor() {
      super();
      for (const [key, value] of Object.entries(config.defaults ?? {})) {
        (this as unknown as Record<string, unknown>)[key] = value;
      }
    }

    protected override async updated(changed: Map<string, unknown>): Promise<void> {
      if (changed.has("src") || changed.has("data"))
        await this.fetcher.fetch(this.src ?? "", !!this.data);
    }

    private get resolvedData(): T[] {
      return this.data ?? this.fetcher.data ?? [];
    }

    protected override render(): TemplateResult | undefined {
      const renderer = config.variants[this.variant];
      if (!renderer) return undefined;

      const extra = {} as P;
      for (const key of Object.keys(config.defaults ?? {})) {
        (extra as Record<string, unknown>)[key] = (this as unknown as Record<string, unknown>)[key];
      }

      return renderer(this.resolvedData, this.theme, this.limit, extra);
    }
  }

  if (!customElements.get(config.tag)) {
    customElements.define(config.tag, DomainChart);
  }
  return DomainChart;
}
