import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/hotspots-chart";
import { hotspotsFixture } from "../../tests/fixtures/hotspots.fixture";
import { hotspotsEnclosureFixture } from "../../tests/fixtures/hotspots-enclosure.fixture";

const meta: Meta = {
  title: "Domain/Hotspots Chart",
  component: "pq-hotspots-chart",
  argTypes: {
    variant: { control: "select", options: ["bubble", "treemap", "enclosure"] },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-hotspots-chart .data=${hotspotsFixture} variant=${args.variant ?? "bubble"} theme=${args.theme ?? "dark"}></pq-hotspots-chart>
    </div>`,
};

export const Treemap: Story = {
  render: () => html`<div style="height: 500px;"><pq-hotspots-chart .data=${hotspotsFixture} variant="treemap"></pq-hotspots-chart></div>`,
};

export const Enclosure: Story = {
  render: (args) => html`
    <div style="height: 600px; width: 600px;">
      <pq-hotspots-chart
        .data=${hotspotsEnclosureFixture}
        variant="enclosure"
        theme=${args.theme ?? "dark"}
      ></pq-hotspots-chart>
    </div>`,
};

export const EnclosureLight: Story = {
  render: () => html`
    <div style="height: 600px; width: 600px; background: white; padding: 1rem;">
      <pq-hotspots-chart
        .data=${hotspotsEnclosureFixture}
        variant="enclosure"
        theme="light"
      ></pq-hotspots-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-hotspots-chart .data=${hotspotsFixture} theme="light"></pq-hotspots-chart></div>`,
};
