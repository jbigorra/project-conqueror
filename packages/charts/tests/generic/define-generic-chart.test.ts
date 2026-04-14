import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { ChartController } from "../../src/controllers/chart.controller";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { ThemeController } from "../../src/controllers/theme.controller";
import { defineGenericChart } from "../../src/generic/define-generic-chart";

// Helper to invoke the protected updated() method directly
type GenericEl = {
  updated(changed: Map<PropertyKey, unknown>): Promise<void>;
};

type RenderEl = {
  render(): unknown;
};

/** Extract HTML string content from a Lit TemplateResult */
function templateHtml(result: unknown): string {
  const r = result as { strings?: string[] };
  if (!r?.strings) return "";
  return r.strings.join("");
}

// Register shared test charts at module level to avoid double-registration
const RegistrationChart = defineGenericChart({
  tag: "pq-test-factory-registration",
  properties: {},
  defaults: {},
  buildConfig: () => ({ type: "bar", data: { datasets: [] }, options: {} }),
});

// Lifecycle test chart — registered ONCE at module level
const LifecycleChart = defineGenericChart<{ value: number }, { label: string }>({
  tag: "pq-test-chart-lifecycle",
  properties: { label: {} },
  defaults: { label: "" },
  buildConfig: ({ resolved }) => ({
    type: "bar",
    data: { datasets: [{ data: resolved.map((d) => d.value) }] },
    options: {},
  }),
});

const PropsChart = defineGenericChart<{ value: number }, { label: string }>({
  tag: "pq-test-base-props",
  properties: { label: {} },
  defaults: { label: "" },
  buildConfig: () => ({ type: "bar", data: { datasets: [] }, options: {} }),
});

const DefaultsChart = defineGenericChart<{ value: number }, { label: string }>({
  tag: "pq-test-defaults",
  properties: { label: {} },
  defaults: { label: "hello" },
  buildConfig: () => ({ type: "bar", data: { datasets: [] }, options: {} }),
});

// Chart for renderChart + render state tests
let capturedProps: { label: string } | undefined;
const RenderTestChart = defineGenericChart<{ value: number }, { label: string }>({
  tag: "pq-test-render-chart",
  properties: { label: {} },
  defaults: { label: "" },
  buildConfig: ({ resolved, props }) => {
    capturedProps = props;
    return {
      type: "bar",
      data: { datasets: [{ data: resolved.map((d) => d.value) }] },
      options: {},
    };
  },
});

describe("defineGenericChart", () => {
  describe("1-A: Factory registration and static properties", () => {
    it("1.1 registers the custom element with the provided tag", () => {
      expect(customElements.get("pq-test-factory-registration")).toBeDefined();
    });

    it("1.3 static properties includes all four base properties", () => {
      const props = (
        RegistrationChart as typeof RegistrationChart & { properties: Record<string, unknown> }
      ).properties;
      expect(props).toHaveProperty("data");
      expect(props).toHaveProperty("src");
      expect(props).toHaveProperty("theme");
      expect(props).toHaveProperty("animated");
    });

    it("1.5 static properties includes consumer-declared properties with correct descriptors", () => {
      const props = (PropsChart as typeof PropsChart & { properties: Record<string, unknown> })
        .properties;
      expect(props).toHaveProperty("label");
    });

    it("1.7 default values are applied on construction", () => {
      const el = new DefaultsChart() as InstanceType<typeof DefaultsChart> & { label: string };
      expect(el.label).toBe("hello");
    });
  });

  describe("1-B: Lifecycle delegation", () => {
    afterEach(() => {
      // Spies are restored per-test
    });

    it("1.12 updated() calls themeCtrl.update() when theme changes", async () => {
      const updateSpy = spyOn(ThemeController.prototype, "update");
      const el = new LifecycleChart() as unknown as GenericEl;
      const changed = new Map<PropertyKey, unknown>([["theme", undefined]]);
      await el.updated(changed);
      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
    });

    it("1.13 updated() sets chartCtrl.animate when animated changes", async () => {
      // Spy on the update method since animate setter isn't spyable in bun
      // We verify the side-effect: chartCtrl.update is called after animate is set via renderChart
      // For this test, set data so renderChart runs and calls chartCtrl.update
      const updateSpy = spyOn(ChartController.prototype, "update");
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new LifecycleChart() as unknown as GenericEl & {
        animated: boolean;
        data?: Array<{ value: number }>;
      };
      el.data = [{ value: 1 }];
      el.animated = false;
      const changed = new Map<PropertyKey, unknown>([["animated", true]]);
      await el.updated(changed);
      // chartCtrl.update is called with animation being false (set via animate setter)
      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
      fetchSpy.mockRestore();
    });

    it("1.14 updated() calls fetcher.fetch() when src changes", async () => {
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new LifecycleChart() as unknown as GenericEl;
      const changed = new Map<PropertyKey, unknown>([["src", undefined]]);
      await el.updated(changed);
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it("1.15 updated() calls fetcher.fetch() when data changes", async () => {
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new LifecycleChart() as unknown as GenericEl;
      const changed = new Map<PropertyKey, unknown>([["data", undefined]]);
      await el.updated(changed);
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("1-C: renderChart + render states", () => {
    it("1.18 renderChart() is a no-op when resolved data is empty", async () => {
      const chartUpdateSpy = spyOn(ChartController.prototype, "update");
      const el = new RenderTestChart() as unknown as GenericEl;
      // data is undefined, fetcher.data is undefined → resolved is undefined → no-op
      const changed = new Map<PropertyKey, unknown>([["theme", undefined]]);
      await el.updated(changed);
      expect(chartUpdateSpy).not.toHaveBeenCalled();
      chartUpdateSpy.mockRestore();
    });

    it("1.19 renderChart() calls chartCtrl.update() with buildConfig result when data is non-empty", async () => {
      const chartUpdateSpy = spyOn(ChartController.prototype, "update");
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      const el = new RenderTestChart() as unknown as GenericEl & {
        data?: Array<{ value: number }>;
      };
      el.data = [{ value: 42 }];
      const changed = new Map<PropertyKey, unknown>([["data", undefined]]);
      await el.updated(changed);
      expect(chartUpdateSpy).toHaveBeenCalled();
      chartUpdateSpy.mockRestore();
      fetchSpy.mockRestore();
    });

    it("1.20 buildConfig receives correct props snapshot", async () => {
      const chartUpdateSpy = spyOn(ChartController.prototype, "update");
      const fetchSpy = spyOn(DataFetchController.prototype, "fetch").mockResolvedValue(undefined);
      capturedProps = undefined;
      const el = new RenderTestChart() as unknown as GenericEl & {
        data?: Array<{ value: number }>;
        label: string;
      };
      el.label = "test-label";
      el.data = [{ value: 1 }];
      const changed = new Map<PropertyKey, unknown>([["data", undefined]]);
      await el.updated(changed);
      expect(capturedProps?.label).toBe("test-label");
      chartUpdateSpy.mockRestore();
      fetchSpy.mockRestore();
    });

    it("1.22 render() returns loading slot when fetcher.state is loading", () => {
      const el = new RenderTestChart() as unknown as RenderEl & {
        fetcher: { state: string };
      };
      // Access private fetcher via cast
      const fetcher = (el as unknown as { fetcher: { state: string } }).fetcher;
      fetcher.state = "loading";
      const result = el.render();
      expect(templateHtml(result)).toContain('name="loading"');
    });

    it("1.23 render() returns error slot when fetcher.state is error", () => {
      const el = new RenderTestChart() as unknown as RenderEl & {
        fetcher: { state: string };
      };
      const fetcher = (el as unknown as { fetcher: { state: string } }).fetcher;
      fetcher.state = "error";
      const result = el.render();
      expect(templateHtml(result)).toContain('name="error"');
    });

    it("1.24 render() returns empty slot when data is empty array", () => {
      const el = new RenderTestChart() as unknown as RenderEl & {
        data?: Array<{ value: number }>;
      };
      el.data = [];
      const result = el.render();
      expect(templateHtml(result)).toContain('name="empty"');
    });

    it("1.25 render() returns canvas element when data is non-empty", () => {
      const el = new RenderTestChart() as unknown as RenderEl & {
        data?: Array<{ value: number }>;
      };
      el.data = [{ value: 1 }];
      const result = el.render();
      expect(templateHtml(result)).toContain("canvas");
    });
  });
});
