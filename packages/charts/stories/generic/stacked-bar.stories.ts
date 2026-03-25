import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/generic/stacked-bar";
import type { StackedBarItem } from "../../src/types";

const sampleData: StackedBarItem[] = [
  { label: "alice", segments: [{ key: "added", value: 4820 }, { key: "deleted", value: 1230 }, { key: "commits", value: 87 }] },
  { label: "bob", segments: [{ key: "added", value: 3540 }, { key: "deleted", value: 980 }, { key: "commits", value: 62 }] },
  { label: "charlie", segments: [{ key: "added", value: 2890 }, { key: "deleted", value: 1540 }, { key: "commits", value: 54 }] },
  { label: "diana", segments: [{ key: "added", value: 2150 }, { key: "deleted", value: 670 }, { key: "commits", value: 41 }] },
];

const meta: Meta = {
  title: "Generic/Stacked Bar",
  component: "pq-stacked-bar",
  argTypes: {
    horizontal: { control: "boolean" },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-stacked-bar .data=${sampleData} ?horizontal=${args.horizontal ?? false} theme=${args.theme ?? "dark"}></pq-stacked-bar>
    </div>`,
};

export const Horizontal: Story = {
  render: () => html`<div style="height: 400px;"><pq-stacked-bar .data=${sampleData} horizontal></pq-stacked-bar></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-stacked-bar .data=${sampleData} theme="light"></pq-stacked-bar></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-stacked-bar .data=${[]}></pq-stacked-bar></div>`,
};
