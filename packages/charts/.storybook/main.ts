import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  addons: [getAbsolutePath("@storybook/addon-docs")],
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

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
