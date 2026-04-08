import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/revisions-chart";
import { revisionsFixture } from "../../tests/fixtures/revisions.fixture";

const meta: Meta = {
  title: "Domain/Revisions Chart",
  component: "pq-revisions-chart",
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
      <pq-revisions-chart .data=${revisionsFixture} variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-revisions-chart>
    </div>`,
};

export const Top10: Story = {
  render: () => html`<div style="height: 400px;"><pq-revisions-chart .data=${revisionsFixture} limit="10"></pq-revisions-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-revisions-chart .data=${revisionsFixture} theme="light"></pq-revisions-chart></div>`,
};
