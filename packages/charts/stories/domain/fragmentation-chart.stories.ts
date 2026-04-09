import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/fragmentation-chart.visual";
import { fragmentationFixture } from "../../tests/fixtures/fragmentation.fixture";

const meta: Meta = {
  title: "Domain/Fragmentation Chart",
  component: "pq-fragmentation-chart",
  argTypes: {
    variant: { control: "select", options: ["bar", "doughnut"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-fragmentation-chart .data=${fragmentationFixture} variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-fragmentation-chart>
    </div>`,
};

export const Doughnut: Story = {
  render: () => html`<div style="height: 400px;"><pq-fragmentation-chart .data=${fragmentationFixture} variant="doughnut"></pq-fragmentation-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-fragmentation-chart .data=${fragmentationFixture} theme="light"></pq-fragmentation-chart></div>`,
};
