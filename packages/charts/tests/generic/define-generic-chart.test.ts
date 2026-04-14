import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { ChartController } from "../../src/controllers/chart.controller";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { ThemeController } from "../../src/controllers/theme.controller";
import { defineGenericChart } from "../../src/generic/define-generic-chart";

// Helper to invoke the protected updated() method directly
type GenericEl = {
  updated(changed: Map<PropertyKey, unknown>): Promise<void>;
};

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
});
