import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/ranked-bar";
import type { RankedBarItem } from "../../src/types";

const sampleData: RankedBarItem[] = [
  { label: "src/core/engine.ts", value: 142 },
  { label: "src/api/routes.ts", value: 98 },
  { label: "src/db/schema.ts", value: 87 },
  { label: "src/auth/login.ts", value: 76 },
  { label: "src/core/bus.ts", value: 65 },
  { label: "src/api/auth.ts", value: 54 },
  { label: "package.json", value: 51 },
  { label: "src/dashboard.ts", value: 48 },
];

const meta: Meta = {
  title: "Generic/Ranked Bar",
  component: "pq-ranked-bar",
  argTypes: {
    sort: { control: "select", options: ["asc", "desc", "none"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    horizontal: { control: "boolean" },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-ranked-bar .data=${sampleData} sort=${args.sort ?? "desc"} limit=${args.limit ?? 0}
        ?horizontal=${args.horizontal ?? true} theme=${args.theme ?? "dark"}></pq-ranked-bar>
    </div>`,
};

export const Vertical: Story = {
  render: () => html`<div style="height: 400px;"><pq-ranked-bar .data=${sampleData} sort="desc" .horizontal=${false}></pq-ranked-bar></div>`,
};

export const LimitedTopN: Story = {
  render: () => html`<div style="height: 300px;"><pq-ranked-bar .data=${sampleData} sort="desc" limit="3"></pq-ranked-bar></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-ranked-bar .data=${[]}></pq-ranked-bar></div>`,
};

export const CustomEmptySlot: Story = {
  render: () => html`<div style="height: 200px;"><pq-ranked-bar .data=${[]}>
    <div slot="empty">No files found. Upload a git log first.</div>
  </pq-ranked-bar></div>`,
};
