import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/authors-chart";
import { authorsFixture } from "../../tests/fixtures/authors.fixture";

const meta: Meta = {
  title: "Domain/Authors Chart",
  component: "pq-authors-chart",
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
      <pq-authors-chart .data=${authorsFixture} variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-authors-chart>
    </div>`,
};

export const Treemap: Story = {
  render: () => html`<div style="height: 500px;"><pq-authors-chart .data=${authorsFixture} variant="treemap"></pq-authors-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-authors-chart .data=${authorsFixture} theme="light"></pq-authors-chart></div>`,
};
