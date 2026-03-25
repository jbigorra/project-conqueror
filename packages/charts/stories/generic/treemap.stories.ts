import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/generic/treemap";
import type { TreemapItem } from "../../src/types";

const sampleData: TreemapItem[] = [
  { path: ["src", "core", "analysis-engine.ts"], value: 142, color: 38 },
  { path: ["src", "api", "routes", "upload.ts"], value: 98, color: 24 },
  { path: ["src", "shared", "database", "schema.ts"], value: 87, color: 18 },
  { path: ["src", "features", "auth", "login.ts"], value: 76, color: 22 },
  { path: ["src", "core", "event-bus.ts"], value: 65, color: 15 },
  { path: ["src", "api", "middleware", "auth.ts"], value: 54, color: 19 },
  { path: ["src", "features", "dashboard", "index.ts"], value: 48, color: 12 },
  { path: ["src", "shared", "utils", "format.ts"], value: 42, color: 9 },
];

const meta: Meta = {
  title: "Generic/Treemap",
  component: "pq-treemap",
  argTypes: {
    "show-labels": { control: "boolean" },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-treemap .data=${sampleData} ?show-labels=${args["show-labels"] ?? true} theme=${args.theme ?? "dark"}></pq-treemap>
    </div>`,
};

export const WithoutLabels: Story = {
  render: () => html`<div style="height: 500px;"><pq-treemap .data=${sampleData}></pq-treemap></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-treemap .data=${sampleData} theme="light" show-labels></pq-treemap></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-treemap .data=${[]}></pq-treemap></div>`,
};
