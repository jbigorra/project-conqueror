import { describe, expect, it } from "bun:test";
import { defineGenericChart } from "../../src/generic/define-generic-chart";

// Register shared test charts at module level to avoid double-registration
const RegistrationChart = defineGenericChart({
  tag: "pq-test-factory-registration",
  properties: {},
  defaults: {},
  buildConfig: () => ({ type: "bar", data: { datasets: [] }, options: {} }),
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
});
