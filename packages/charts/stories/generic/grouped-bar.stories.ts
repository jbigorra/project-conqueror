import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/grouped-bar";
import type { GroupedBarItem } from "../../src/types";

const sampleData: GroupedBarItem[] = [
  { label: "alice", groups: [{ key: "added", value: 4820 }, { key: "deleted", value: 1230 }, { key: "commits", value: 87 }] },
  { label: "bob", groups: [{ key: "added", value: 3540 }, { key: "deleted", value: 980 }, { key: "commits", value: 62 }] },
  { label: "charlie", groups: [{ key: "added", value: 2890 }, { key: "deleted", value: 1540 }, { key: "commits", value: 54 }] },
  { label: "diana", groups: [{ key: "added", value: 2150 }, { key: "deleted", value: 670 }, { key: "commits", value: 41 }] },
];

const meta: Meta = {
  title: "Generic/Grouped Bar",
  component: "pq-grouped-bar",
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
      <pq-grouped-bar .data=${sampleData} ?horizontal=${args.horizontal ?? false} theme=${args.theme ?? "dark"}></pq-grouped-bar>
    </div>`,
};

export const Horizontal: Story = {
  render: () => html`<div style="height: 400px;"><pq-grouped-bar .data=${sampleData} horizontal></pq-grouped-bar></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-grouped-bar .data=${sampleData} theme="light"></pq-grouped-bar></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-grouped-bar .data=${[]}></pq-grouped-bar></div>`,
};
