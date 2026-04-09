import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/main-dev-revs-chart.visual";
import { mainDevFixture } from "../../tests/fixtures/main-dev.fixture";

const meta: Meta = {
  title: "Domain/Main Dev Revs Chart",
  component: "pq-main-dev-revs-chart",
  argTypes: {
    variant: { control: "select", options: ["bar", "treemap"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-main-dev-revs-chart .data=${mainDevFixture} variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-main-dev-revs-chart>
    </div>`,
};

export const Treemap: Story = {
  render: () => html`<div style="height: 500px;"><pq-main-dev-revs-chart .data=${mainDevFixture} variant="treemap"></pq-main-dev-revs-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-main-dev-revs-chart .data=${mainDevFixture} theme="light"></pq-main-dev-revs-chart></div>`,
};
