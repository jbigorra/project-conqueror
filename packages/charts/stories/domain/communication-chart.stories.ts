import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/communication-chart";
import { communicationFixture } from "../../tests/fixtures/communication.fixture";

const meta: Meta = {
  title: "Domain/Communication Chart",
  component: "pq-communication-chart",
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
      <pq-communication-chart .data=${communicationFixture} variant=${args.variant ?? "bubble"}
        limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-communication-chart>
    </div>`,
};

export const Bar: Story = {
  render: () => html`<div style="height: 500px;"><pq-communication-chart .data=${communicationFixture} variant="bar"></pq-communication-chart></div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-communication-chart .data=${communicationFixture} theme="light"></pq-communication-chart></div>`,
};
