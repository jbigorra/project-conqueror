import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/author-churn-chart.visual";
import { authorChurnFixture } from "../../tests/fixtures/author-churn.fixture";

const meta: Meta = {
  title: "Domain/Author Churn Chart",
  component: "pq-author-churn-chart",
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
      <pq-author-churn-chart .data=${authorChurnFixture} variant=${args.variant ?? "grouped"} theme=${args.theme ?? "dark"}></pq-author-churn-chart>
    </div>`,
};

export const Stacked: Story = {
  render: () => html`<div style="height: 400px;"><pq-author-churn-chart .data=${authorChurnFixture} variant="stacked"></pq-author-churn-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-author-churn-chart .data=${authorChurnFixture} theme="light"></pq-author-churn-chart></div>`,
};
