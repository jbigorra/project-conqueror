import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/histogram.visual";
import type { HistogramItem } from "../../src/types";

const sampleData: HistogramItem[] = [
  2, 3, 5, 7, 8, 11, 12, 15, 18, 24, 30, 4, 6, 9, 11, 15, 18, 3, 5, 7,
  8, 12, 24, 2, 4, 30, 11, 8, 5, 7
].map((v) => ({ value: v }));

const meta: Meta = {
  title: "Generic/Histogram",
  component: "pq-histogram",
  argTypes: {
    bins: { control: { type: "number", min: 2, max: 20 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-histogram .data=${sampleData} bins=${args.bins ?? 8} theme=${args.theme ?? "dark"}
        x-label="Age (months)" y-label="Count"></pq-histogram>
    </div>`,
};

export const MoreBins: Story = {
  render: () => html`<div style="height: 400px;"><pq-histogram .data=${sampleData} bins="15" x-label="Value"></pq-histogram></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-histogram .data=${sampleData} theme="light" bins="8"></pq-histogram></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-histogram .data=${[]}></pq-histogram></div>`,
};
