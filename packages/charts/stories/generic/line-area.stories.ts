import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/line-area";
import type { LineAreaPoint } from "../../src/types";

const sampleData: LineAreaPoint[] = [
  { x: "2024-01-15", series: [{ key: "added", value: 320 }, { key: "deleted", value: 85 }] },
  { x: "2024-01-22", series: [{ key: "added", value: 540 }, { key: "deleted", value: 120 }] },
  { x: "2024-01-29", series: [{ key: "added", value: 210 }, { key: "deleted", value: 340 }] },
  { x: "2024-02-05", series: [{ key: "added", value: 780 }, { key: "deleted", value: 95 }] },
  { x: "2024-02-12", series: [{ key: "added", value: 430 }, { key: "deleted", value: 210 }] },
  { x: "2024-02-19", series: [{ key: "added", value: 650 }, { key: "deleted", value: 180 }] },
];

const meta: Meta = {
  title: "Generic/Line Area",
  component: "pq-line-area",
  argTypes: {
    fill: { control: "boolean" },
    stacked: { control: "boolean" },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-line-area .data=${sampleData} ?fill=${args.fill ?? false} ?stacked=${args.stacked ?? false} theme=${args.theme ?? "dark"}></pq-line-area>
    </div>`,
};

export const Area: Story = {
  render: () => html`<div style="height: 400px;"><pq-line-area .data=${sampleData} fill></pq-line-area></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-line-area .data=${sampleData} theme="light" fill></pq-line-area></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-line-area .data=${[]}></pq-line-area></div>`,
};
