import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "../../src/domain/revisions-chart.visual";
import { revisionsFixture } from "../../tests/fixtures/revisions.fixture";

const meta: Meta = {
  title: "Themes/Theme Comparison",
};
export default meta;
type Story = StoryObj;

export const AllThemes: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; padding: 1rem;">
      <div>
        <h3 style="color: #e0e0e0; margin: 0 0 0.5rem;">Dark (default)</h3>
        <div style="height: 300px;">
          <pq-revisions-chart .data=${revisionsFixture} theme="dark" limit="8"></pq-revisions-chart>
        </div>
      </div>
      <div style="background: white; padding: 0.5rem; border-radius: 4px;">
        <h3 style="color: #1a1a2e; margin: 0 0 0.5rem;">Light</h3>
        <div style="height: 300px;">
          <pq-revisions-chart .data=${revisionsFixture} theme="light" limit="8"></pq-revisions-chart>
        </div>
      </div>
      <div style="background: #11191f; padding: 0.5rem; border-radius: 4px;">
        <h3 style="color: #c0caf5; margin: 0 0 0.5rem;">Pico</h3>
        <div style="height: 300px;">
          <pq-revisions-chart .data=${revisionsFixture} theme="pico" limit="8"></pq-revisions-chart>
        </div>
      </div>
    </div>
  `,
};

export const DarkTheme: Story = {
  render: () => html`
    <div style="height: 400px;">
      <pq-revisions-chart .data=${revisionsFixture} theme="dark" limit="10"></pq-revisions-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`
    <div style="height: 400px; background: white; padding: 1rem;">
      <pq-revisions-chart .data=${revisionsFixture} theme="light" limit="10"></pq-revisions-chart>
    </div>`,
};

export const PicoTheme: Story = {
  render: () => html`
    <div style="height: 400px; background: #11191f; padding: 1rem;">
      <pq-revisions-chart .data=${revisionsFixture} theme="pico" limit="10"></pq-revisions-chart>
    </div>`,
};
