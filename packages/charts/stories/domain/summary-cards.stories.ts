import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/summary-cards.visual";
import { summaryFixture } from "../../tests/fixtures/summary.fixture";

const meta: Meta = {
  title: "Domain/Summary Cards",
  component: "pq-summary-cards",
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<pq-summary-cards .data=${summaryFixture}></pq-summary-cards>`,
};

export const LightTheme: Story = {
  render: () => html`
    <div style="background: white; padding: 1rem;">
      <pq-summary-cards
        .data=${summaryFixture}
        style="--pq-chart-text: #1a1a2e; --pq-chart-bg: #ffffff; --pq-chart-surface: rgba(0,0,0,0.05); --pq-chart-border: rgba(0,0,0,0.1); --pq-chart-accent: #7c3aed;"
      ></pq-summary-cards>
    </div>`,
};

export const Empty: Story = {
  render: () => html`<pq-summary-cards .data=${[]}></pq-summary-cards>`,
};
