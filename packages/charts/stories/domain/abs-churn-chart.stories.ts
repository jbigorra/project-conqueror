import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/abs-churn-chart";
import { absChurnFixture } from "../../tests/fixtures/abs-churn.fixture";

const meta: Meta = {
  title: "Domain/Abs Churn Chart",
  component: "pq-abs-churn-chart",
  argTypes: {
    variant: { control: "select", options: ["area", "line"] },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) =>
    html` <div style="height: 400px;">
      <pq-abs-churn-chart
        .data=${absChurnFixture}
        variant=${args.variant ?? "area"}
        theme=${args.theme ?? "dark"}
      ></pq-abs-churn-chart>
    </div>`,
};

export const LineVariant: Story = {
  render: () =>
    html`<div style="height: 400px;">
      <pq-abs-churn-chart
        .data=${absChurnFixture}
        variant="line"
      ></pq-abs-churn-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () =>
    html`<div style="height: 400px; background: white; padding: 1rem;">
      <pq-abs-churn-chart
        .data=${absChurnFixture}
        theme="light"
      ></pq-abs-churn-chart>
    </div>`,
};
