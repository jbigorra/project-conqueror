import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/ownership-chart";
import { entityOwnershipFixture } from "../../tests/fixtures/entity-ownership.fixture";

const meta: Meta = {
  title: "Domain/Ownership Chart",
  component: "pq-ownership-chart",
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
      <pq-ownership-chart .data=${entityOwnershipFixture} variant=${args.variant ?? "stacked"} theme=${args.theme ?? "dark"}></pq-ownership-chart>
    </div>`,
};

export const Doughnut: Story = {
  render: () => html`<div style="height: 400px;">
    <pq-ownership-chart .data=${entityOwnershipFixture} variant="doughnut" entity="src/core/analysis-engine.ts"></pq-ownership-chart>
  </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-ownership-chart .data=${entityOwnershipFixture} theme="light"></pq-ownership-chart></div>`,
};
