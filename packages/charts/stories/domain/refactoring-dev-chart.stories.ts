import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/refactoring-dev-chart.visual";
import { refactoringMainDevFixture } from "../../tests/fixtures/refactoring-main-dev.fixture";

const meta: Meta = {
  title: "Domain/Refactoring Dev Chart",
  component: "pq-refactoring-dev-chart",
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
      <pq-refactoring-dev-chart .data=${refactoringMainDevFixture} variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-refactoring-dev-chart>
    </div>`,
};

export const Treemap: Story = {
  render: () => html`<div style="height: 500px;"><pq-refactoring-dev-chart .data=${refactoringMainDevFixture} variant="treemap"></pq-refactoring-dev-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-refactoring-dev-chart .data=${refactoringMainDevFixture} theme="light"></pq-refactoring-dev-chart></div>`,
};
