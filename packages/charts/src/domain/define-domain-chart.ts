import type { TemplateResult } from "lit";
import { LitElement } from "lit";
import { DataFetchController } from "../controllers/data-fetch.controller";
import type { ThemePreset } from "../types";

/**
 * Strategy function that renders a specific chart variant from domain data.
 *
 * Receives the resolved data array, the current theme preset, and the
 * configured item limit. Returns a Lit `TemplateResult` delegating to
 * the appropriate generic chart component.
 *
 * @typeParam T - The domain data item type this variant renders.
 * @param data - Resolved non-empty data array (inline prop or fetched).
 * @param theme - Current theme preset (may be undefined).
 * @param limit - Maximum number of items to display (default `20`).
 * @returns A Lit `TemplateResult` wrapping the target generic chart.
 *
 * @example
 * ```ts
 * const barRenderer: VariantRenderer<Revision> = (data, theme, limit) =>
 *   html`<pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit} .theme=${theme}></pq-ranked-bar>`;
 * ```
 */
export type VariantRenderer<T> = (data: T[], theme?: ThemePreset, limit?: number) => TemplateResult;

/**
 * Configuration object passed to {@link defineDomainChart}.
 *
 * @typeParam T - The domain data item type this chart renders.
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
 */
export type DomainChartConfig<T> = {
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
   * Each renderer receives the resolved data, current theme, and limit,
   * and returns a Lit `TemplateResult` delegating to a generic chart component.
   */
  variants: Record<string, VariantRenderer<T>>;

  /**
   * Default maximum number of items to show in ranked/bar variants.
   * Defaults to `20` when omitted.
   */
  limit?: number;
};

/**
 * Factory that creates and registers a domain-specific Lit Web Component.
 *
 * All shared infrastructure (`DataFetchController`, base properties, lifecycle,
 * `resolvedData` getter) is handled by the factory. Consumers supply only
 * the data type, available variants (as renderer functions), and the default variant.
 *
 * No class inheritance. No abstract methods. Composition only.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @param config - Component configuration: tag, defaultVariant, variants map, optional limit.
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
 */
export function defineDomainChart<T>(config: DomainChartConfig<T>): typeof LitElement {
  class DomainChart extends LitElement {
    static override properties = {
      data: { type: Array },
      src: {},
      theme: {},
      variant: {},
      limit: { type: Number },
    };

    private fetcher = new DataFetchController<T>(this);

    data?: T[];
    src?: string;
    theme?: ThemePreset;
    variant: string = config.defaultVariant;
    limit: number = config.limit ?? 20;

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
      return renderer(this.resolvedData, this.theme, this.limit);
    }
  }

  customElements.define(config.tag, DomainChart);
  return DomainChart;
}
