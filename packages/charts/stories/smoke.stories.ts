import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";

const meta: Meta = {
  title: "Smoke Test",
};

export default meta;

type Story = StoryObj;

export const Works: Story = {
  render: () => html`<p>Storybook is working.</p>`,
};
