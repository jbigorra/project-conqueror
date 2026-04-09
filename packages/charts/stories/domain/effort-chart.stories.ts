import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/effort-chart.visual";
import { entityEffortFixture } from "../../tests/fixtures/entity-effort.fixture";

const meta: Meta = {
  title: "Domain/Effort Chart",
  component: "pq-effort-chart",
  argTypes: {
    variant: { control: "select", options: ["stacked", "doughnut"] },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-effort-chart .data=${entityEffortFixture} variant=${args.variant ?? "stacked"} theme=${args.theme ?? "dark"}></pq-effort-chart>
    </div>`,
};

export const Doughnut: Story = {
  render: () => html`<div style="height: 400px;">
    <pq-effort-chart .data=${entityEffortFixture} variant="doughnut" entity="src/core/analysis-engine.ts"></pq-effort-chart>
  </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-effort-chart .data=${entityEffortFixture} theme="light"></pq-effort-chart></div>`,
};
