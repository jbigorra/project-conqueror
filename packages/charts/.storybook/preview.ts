import type { Preview } from "@storybook/web-components-vite";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        dark: { name: "dark", value: "#1a1a2e" },
        light: { name: "light", value: "#ffffff" }
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "dark"
    }
  }
};

export default preview;
