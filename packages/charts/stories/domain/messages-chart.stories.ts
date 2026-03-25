import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/messages-chart";
import { messagesFixture } from "../../tests/fixtures/messages.fixture";

const meta: Meta = {
  title: "Domain/Messages Chart",
  component: "pq-messages-chart",
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
      <pq-messages-chart .data=${messagesFixture} limit=${args.limit ?? 20} theme=${args.theme ?? "dark"}></pq-messages-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-messages-chart .data=${messagesFixture} theme="light"></pq-messages-chart></div>`,
};
