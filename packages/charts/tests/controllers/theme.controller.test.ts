import { describe, expect, it } from "bun:test";
import type { ReactiveControllerHost } from "lit";
import {
  resolveTheme,
  ThemeController,
  toChartJsOptions,
} from "../../src/controllers/theme.controller";
import { dark } from "../../src/themes/dark";
import { light } from "../../src/themes/light";
import { pico } from "../../src/themes/pico";
import type { MockHost } from "../helpers/mock-host";
import { createMockHost } from "../helpers/mock-host";

type MockHostAsElement = MockHost & ReactiveControllerHost & HTMLElement;

describe("resolveTheme", () => {
  it("returns dark preset by default", () => {
    const theme = resolveTheme();
    expect(theme).toEqual(dark);
  });

  it("returns dark preset when 'dark' is passed", () => {
    const theme = resolveTheme("dark");
    expect(theme).toEqual(dark);
  });

  it("returns light preset when 'light' is passed", () => {
    const theme = resolveTheme("light");
    expect(theme).toEqual(light);
  });

  it("returns pico preset when 'pico' is passed", () => {
    const theme = resolveTheme("pico");
    expect(theme).toEqual(pico);
  });

  it("applies CSS overrides on top of the base preset", () => {
    const overrides: Record<string, string> = {
      "--pq-chart-bg": "#123456",
      "--pq-chart-text": "#abcdef",
    };
    const theme = resolveTheme("dark", overrides);
    expect(theme.bg).toBe("#123456");
    expect(theme.text).toBe("#abcdef");
    // unoverridden values stay from preset
    expect(theme.grid).toBe(dark.grid);
  });
});

describe("toChartJsOptions", () => {
  it("maps ThemeValues to Chart.js option structure", () => {
    const theme = dark;
    const opts = toChartJsOptions(theme);

    expect(opts.color).toBe(theme.text);
    expect(opts.borderColor).toBe(theme.border);
    expect(opts.backgroundColor).toBe(theme.bg);

    expect(opts.scales.x.ticks.color).toBe(theme.text);
    expect(opts.scales.x.grid.color).toBe(theme.grid);
    expect(opts.scales.y.ticks.color).toBe(theme.text);
    expect(opts.scales.y.grid.color).toBe(theme.grid);

    expect(opts.plugins.legend.labels.color).toBe(theme.text);
    expect(opts.plugins.tooltip.backgroundColor).toBe(theme.tooltipBg);
    expect(opts.plugins.tooltip.titleColor).toBe(theme.text);
    expect(opts.plugins.tooltip.bodyColor).toBe(theme.text);
  });

  it("parses fontSize string to numeric value for font size", () => {
    const theme = { ...dark, fontSize: "14px" };
    const opts = toChartJsOptions(theme);
    expect(opts.font.size).toBe(14);
  });
});

describe("ThemeController", () => {
  it("registers itself with the host on construction", () => {
    const host = createMockHost();
    const ctrl = new ThemeController(host as unknown as MockHostAsElement);
    expect(host.controllers).toContain(ctrl);
  });

  it("has dark theme values by default after hostConnected", () => {
    const host = createMockHost();
    const ctrl = new ThemeController(host as unknown as MockHostAsElement);
    ctrl.hostConnected();
    expect(ctrl.theme).toEqual(dark);
  });

  it("switches preset when update() is called with a different preset", () => {
    const host = createMockHost();
    const ctrl = new ThemeController(host as unknown as MockHostAsElement);
    ctrl.hostConnected();
    ctrl.update("light");
    expect(ctrl.theme).toEqual(light);
  });

  it("exposes chart.js options via the options property", () => {
    const host = createMockHost();
    const ctrl = new ThemeController(host as unknown as MockHostAsElement);
    ctrl.hostConnected();
    expect(ctrl.options.color).toBe(dark.text);
  });
});
