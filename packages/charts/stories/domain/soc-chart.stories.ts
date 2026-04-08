import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/soc-chart";
import { socFixture } from "../../tests/fixtures/soc.fixture";

const meta: Meta = {
  title: "Domain/Soc Chart",
  component: "pq-soc-chart",
  argTypes: {
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-soc-chart .data=${socFixture} limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-soc-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-soc-chart .data=${socFixture} theme="light"></pq-soc-chart></div>`,
};
