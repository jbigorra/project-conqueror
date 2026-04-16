import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { html } from "lit";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { defineDomainChart } from "../../src/domain/define-domain-chart";

type RenderEl = {
  render(): unknown;
};

// Register shared test charts at module level to avoid double-registration

const RegistrationChart = defineDomainChart<{ id: string }>({
  tag: "pq-test-domain-registration",
  defaultVariant: "bar",
  variants: {
    bar: (data, _theme, _limit) => html`<span>${data.length}</span>`,
  },
});

const DefaultVariantChart = defineDomainChart<{ id: string }>({
  tag: "pq-test-domain-default-variant",
  defaultVariant: "treemap",
  variants: {
    treemap: (_data, _theme) => html`<div>treemap</div>`,
  },
});

const LimitChart = defineDomainChart<{ id: string }>({
  tag: "pq-test-domain-limit-default",
  defaultVariant: "bar",
  variants: {
    bar: (_data, _theme, _limit) => html`<span>bar</span>`,
  },
  // No limit specified — should default to 20
});

const LimitCustomChart = defineDomainChart<{ id: string }>({
  tag: "pq-test-domain-limit-custom",
  defaultVariant: "bar",
  variants: {
    bar: (_data, _theme, _limit) => html`<span>bar</span>`,
  },
  limit: 10,
});

// Lifecycle test chart
const LifecycleDomainChart = defineDomainChart<{ value: number }>({
  tag: "pq-test-domain-lifecycle",
  defaultVariant: "bar",
  variants: {
    bar: (data, _theme, _limit) => html`<span>${data.length}</span>`,
  },
});

// ResolvedData test chart
const ResolvedDataChart = defineDomainChart<{ value: number }>({
  tag: "pq-test-domain-resolved",
  defaultVariant: "bar",
  variants: {
    bar: (data, _theme, _limit) => html`<span>${data.length}</span>`,
  },
});

// Render test chart — captures what renderer was called
let lastRendererCalled: string | undefined;
let lastDataReceived: unknown[] | undefined;
let lastThemeReceived: unknown;
let lastLimitReceived: number | undefined;

const RenderVariantChart = defineDomainChart<{ value: number }>({
  tag: "pq-test-domain-render",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) => {
      lastRendererCalled = "bar";
      lastDataReceived = data;
      lastThemeReceived = theme;
      lastLimitReceived = limit;
      return html`<pq-bar-test></pq-bar-test>`;
    },
    treemap: (data, theme, limit) => {
      lastRendererCalled = "treemap";
      lastDataReceived = data;
      lastThemeReceived = theme;
      lastLimitReceived = limit;
      return html`<pq-treemap-test></pq-treemap-test>`;
    },
  },
});

const UnknownVariantChart = defineDomainChart<{ value: number }>({
  tag: "pq-test-domain-unknown-variant",
  defaultVariant: "bar",
  variants: {
    bar: (_data) => html`<span>bar</span>`,
  },
});

// ─── Task A: extra props support ─────────────────────────────────────────────

// Chart with extra `bins` property (mimics age-chart)
let lastExtraReceived: Record<string, unknown> | undefined;

const ExtraPropsChart = defineDomainChart<{ value: number }, { bins: number }>({
  tag: "pq-test-domain-extra-props",
  defaultVariant: "histogram",
  properties: { bins: { type: Number } },
  defaults: { bins: 10 },
  variants: {
    histogram: (data, _theme, _limit, extra) => {
      lastExtraReceived = extra as Record<string, unknown>;
      return html`<span>${data.length}-${(extra as { bins: number }).bins}</span>`;
    },
  },
});

// Chart with extra `entity` property (mimics effort-chart and ownership-chart)
const ExtraEntityChart = defineDomainChart<{ value: number }, { entity: string }>({
  tag: "pq-test-domain-extra-entity",
  defaultVariant: "stacked",
  properties: { entity: {} },
  defaults: { entity: "" },
  variants: {
    stacked: (_data, _theme, _limit, _extra) => html`<span>stacked</span>`,
    doughnut: (data, _theme, _limit, extra) => {
      lastExtraReceived = extra as Record<string, unknown>;
      return html`<span>${data.length}-${(extra as { entity: string }).entity}</span>`;
    },
  },
});

describe("defineDomainChart", () => {
  describe("F: Double-registration guard", () => {
    it("F.1 calling defineDomainChart twice with the same tag does not throw", () => {
      expect(() => {
        defineDomainChart<{ id: string }>({
          tag: "pq-test-domain-registration", // already registered at module level
          defaultVariant: "bar",
          variants: {
            bar: (_data) => html`<span>bar</span>`,
          },
        });
      }).not.toThrow();
    });
  });

  describe("2-A: Factory registration and defaults", () => {
    it("2.1 registers the custom element with the provided tag", () => {
      expect(customElements.get("pq-test-domain-registration")).toBeDefined();
    });

    it("2.3 default variant is applied — instantiate component, verify variant equals defaultVariant", () => {
      const el = new DefaultVariantChart() as InstanceType<typeof DefaultVariantChart> & {
        variant: string;
      };
      expect(el.variant).toBe("treemap");
    });

    it("2.5 limit defaults to config.limit ?? 20 when not specified in config", () => {
      const el = new LimitChart() as InstanceType<typeof LimitChart> & { limit: number };
      expect(el.limit).toBe(20);
    });

    it("2.5b limit uses config.limit when specified", () => {
      const el = new LimitCustomChart() as InstanceType<typeof LimitCustomChart> & {
        limit: number;
      };
      expect(el.limit).toBe(10);
    });

    it("2.3b static properties includes all five base properties", () => {
      const props = (
        RegistrationChart as typeof RegistrationChart & { properties: Record<string, unknown> }
      ).properties;
      expect(props).toHaveProperty("data");
      expect(props).toHaveProperty("src");
      expect(props).toHaveProperty("theme");
      expect(props).toHaveProperty("variant");
      expect(props).toHaveProperty("limit");
    });
  });

  describe("2-B: Lifecycle delegation", () => {
    afterEach(() => {
      // Spies restored per test
    });

    it("2.10 updated() calls fetcher.fetch() when src changes", async () => {
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new LifecycleDomainChart() as unknown as {
        updated(changed: Map<PropertyKey, unknown>): Promise<void>;
      };
      const changed = new Map<PropertyKey, unknown>([["src", undefined]]);
      await el.updated(changed);
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it("2.11 updated() calls fetcher.fetch() when data changes", async () => {
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new LifecycleDomainChart() as unknown as {
        updated(changed: Map<PropertyKey, unknown>): Promise<void>;
      };
      const changed = new Map<PropertyKey, unknown>([["data", undefined]]);
      await el.updated(changed);
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("2-B: resolvedData getter", () => {
    it("2.13 resolvedData returns this.data when data prop is set", () => {
      const el = new ResolvedDataChart() as InstanceType<typeof ResolvedDataChart> & {
        data?: Array<{ value: number }>;
        resolvedData: Array<{ value: number }>;
      };
      const items = [{ value: 1 }, { value: 2 }];
      el.data = items;
      // Access via prototype cast since it's a private getter
      const resolved = (el as unknown as { resolvedData: Array<{ value: number }> }).resolvedData;
      expect(resolved).toEqual(items);
    });

    it("2.14 resolvedData returns fetcher.data when data prop is not set", () => {
      const el = new ResolvedDataChart() as InstanceType<typeof ResolvedDataChart> & {
        data?: Array<{ value: number }>;
      };
      const fetcher = (el as unknown as { fetcher: DataFetchController<{ value: number }> })
        .fetcher;
      fetcher.data = [{ value: 99 }];
      const resolved = (el as unknown as { resolvedData: Array<{ value: number }> }).resolvedData;
      expect(resolved).toEqual([{ value: 99 }]);
    });

    it("2.15 resolvedData returns [] when neither data nor fetcher.data is set", () => {
      const el = new ResolvedDataChart();
      const resolved = (el as unknown as { resolvedData: Array<{ value: number }> }).resolvedData;
      expect(resolved).toEqual([]);
    });
  });

  describe("A: Extra props support", () => {
    it("A.1 extra prop has its default value when instantiated", () => {
      const el = new ExtraPropsChart() as InstanceType<typeof ExtraPropsChart> & { bins: number };
      expect(el.bins).toBe(10);
    });

    it("A.2 static properties includes extra prop key from config.properties", () => {
      const props = (
        ExtraPropsChart as typeof ExtraPropsChart & { properties: Record<string, unknown> }
      ).properties;
      expect(props).toHaveProperty("bins");
    });

    it("A.3 render() passes extra props as 4th argument to variant renderer", () => {
      lastExtraReceived = undefined;
      const el = new ExtraPropsChart() as InstanceType<typeof ExtraPropsChart> & {
        data?: Array<{ value: number }>;
        bins: number;
      };
      el.data = [{ value: 1 }];
      el.bins = 7;
      (el as unknown as RenderEl).render();
      expect(lastExtraReceived).toEqual({ bins: 7 });
    });

    it("A.4 extra string prop defaults to empty string when instantiated", () => {
      const el = new ExtraEntityChart() as InstanceType<typeof ExtraEntityChart> & {
        entity: string;
      };
      expect(el.entity).toBe("");
    });

    it("A.5 extra entity prop is passed to variant renderer as 4th argument", () => {
      lastExtraReceived = undefined;
      const el = new ExtraEntityChart() as InstanceType<typeof ExtraEntityChart> & {
        data?: Array<{ value: number }>;
        entity: string;
        variant: string;
      };
      el.data = [{ value: 42 }];
      el.entity = "src/main.ts";
      el.variant = "doughnut";
      (el as unknown as RenderEl).render();
      expect(lastExtraReceived).toEqual({ entity: "src/main.ts" });
    });
  });

  describe("2-B: render delegation", () => {
    it("2.17 render() calls the variant renderer with (resolvedData, theme, limit)", () => {
      lastRendererCalled = undefined;
      lastDataReceived = undefined;
      lastThemeReceived = undefined;
      lastLimitReceived = undefined;

      const el = new RenderVariantChart() as InstanceType<typeof RenderVariantChart> & {
        data?: Array<{ value: number }>;
        theme?: string;
        limit: number;
        variant: string;
      };
      el.data = [{ value: 1 }];
      el.theme = "dark" as never;
      el.limit = 5;
      el.variant = "bar";

      const renderEl = el as unknown as RenderEl;
      renderEl.render();

      expect(lastRendererCalled).toBe("bar");
      expect(lastDataReceived).toEqual([{ value: 1 }]);
      expect(lastThemeReceived).toBe("dark");
      expect(lastLimitReceived).toBe(5);
    });

    it("2.18 render() returns undefined for an unknown variant", () => {
      const el = new UnknownVariantChart() as InstanceType<typeof UnknownVariantChart> & {
        variant: string;
      };
      el.variant = "unknown-variant-xyz";
      const result = (el as unknown as RenderEl).render();
      expect(result).toBeUndefined();
    });

    it("2.20 switching variant at runtime calls the new renderer", () => {
      lastRendererCalled = undefined;

      const el = new RenderVariantChart() as InstanceType<typeof RenderVariantChart> & {
        data?: Array<{ value: number }>;
        variant: string;
      };
      el.data = [{ value: 1 }];
      el.variant = "treemap";

      (el as unknown as RenderEl).render();

      expect(lastRendererCalled).toBe("treemap");
    });
  });
});
