import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/entity-churn-chart.visual";
import { entityChurnFixture } from "../../tests/fixtures/entity-churn.fixture";

const meta: Meta = {
  title: "Domain/Entity Churn Chart",
  component: "pq-entity-churn-chart",
  argTypes: {
    variant: { control: "select", options: ["grouped", "stacked"] },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-entity-churn-chart .data=${entityChurnFixture} variant=${args.variant ?? "grouped"} theme=${args.theme ?? "dark"}></pq-entity-churn-chart>
    </div>`,
};

export const Stacked: Story = {
  render: () => html`<div style="height: 400px;"><pq-entity-churn-chart .data=${entityChurnFixture} variant="stacked"></pq-entity-churn-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-entity-churn-chart .data=${entityChurnFixture} theme="light"></pq-entity-churn-chart></div>`,
};
