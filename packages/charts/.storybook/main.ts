import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  addons: ["@storybook/addon-essentials"],
  viteFinal: async (config) => ({
    ...config,
    build: {
      ...config.build,
      target: "esnext",
    },
    esbuild: {
      ...config.esbuild,
      target: "esnext",
    },
    optimizeDeps: {
      ...config.optimizeDeps,
      esbuildOptions: {
        ...config.optimizeDeps?.esbuildOptions,
        target: "esnext",
      },
    },
  }),
};

export default config;
