import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/doughnut.visual";
import type { DoughnutItem } from "../../src/types";

const sampleData: DoughnutItem[] = [
  { label: "alice@example.com", value: 890 },
  { label: "bob@example.com", value: 540 },
  { label: "charlie@example.com", value: 390 },
  { label: "diana@example.com", value: 210 },
  { label: "eve@example.com", value: 120 },
];

const meta: Meta = {
  title: "Generic/Doughnut",
  component: "pq-doughnut",
  argTypes: {
    theme: { control: "select", options: ["dark", "light", "pico"] },
    "show-legend": { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-doughnut .data=${sampleData} theme=${args.theme ?? "dark"}></pq-doughnut>
    </div>`,
};

export const WithCenterLabel: Story = {
  render: () => html`<div style="height: 400px;"><pq-doughnut .data=${sampleData} center-label="Ownership"></pq-doughnut></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-doughnut .data=${sampleData} theme="light"></pq-doughnut></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-doughnut .data=${[]}></pq-doughnut></div>`,
};
