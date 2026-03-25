import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/coupling-chart";
import { couplingFixture } from "../../tests/fixtures/coupling.fixture";

const meta: Meta = {
  title: "Domain/Coupling Chart",
  component: "pq-coupling-chart",
  argTypes: {
    variant: { control: "select", options: ["bubble", "bar"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-coupling-chart .data=${couplingFixture} variant=${args.variant ?? "bubble"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-coupling-chart>
    </div>`,
};

export const Bar: Story = {
  render: () => html`<div style="height: 500px;"><pq-coupling-chart .data=${couplingFixture} variant="bar"></pq-coupling-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-coupling-chart .data=${couplingFixture} theme="light"></pq-coupling-chart></div>`,
};
