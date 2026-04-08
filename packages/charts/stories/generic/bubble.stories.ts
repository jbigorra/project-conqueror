import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/generic/bubble";
import type { BubbleItem } from "../../src/types";

const sampleData: BubbleItem[] = [
  { label: "analysis-engine.ts", x: 142, y: 38, r: 25 },
  { label: "upload.ts", x: 98, y: 24, r: 18 },
  { label: "schema.ts", x: 87, y: 18, r: 14 },
  { label: "login.ts", x: 76, y: 22, r: 16 },
  { label: "event-bus.ts", x: 65, y: 15, r: 12 },
  { label: "auth.ts", x: 54, y: 19, r: 15 },
  { label: "dashboard.ts", x: 48, y: 12, r: 10 },
];

const meta: Meta = {
  title: "Generic/Bubble",
  component: "pq-bubble",
  argTypes: {
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-bubble .data=${sampleData} theme=${args.theme ?? "dark"}></pq-bubble>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-bubble .data=${sampleData} theme="light"></pq-bubble></div>`,
};

export const Empty: Story = {
  render: () => html`<div style="height: 200px;"><pq-bubble .data=${[]}></pq-bubble></div>`,
};
