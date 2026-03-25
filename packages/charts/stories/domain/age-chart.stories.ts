import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/age-chart";
import { ageFixture } from "../../tests/fixtures/age.fixture";

const meta: Meta = {
  title: "Domain/Age Chart",
  component: "pq-age-chart",
  argTypes: {
    variant: { control: "select", options: ["histogram", "bar"] },
    bins: { control: { type: "number", min: 2, max: 20 } },
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-age-chart .data=${ageFixture} variant=${args.variant ?? "histogram"}
        bins=${args.bins ?? 8} limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-age-chart>
    </div>`,
};

export const Bar: Story = {
  render: () => html`<div style="height: 500px;"><pq-age-chart .data=${ageFixture} variant="bar"></pq-age-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 400px; background: white; padding: 1rem;">
    <pq-age-chart .data=${ageFixture} theme="light"></pq-age-chart></div>`,
};
