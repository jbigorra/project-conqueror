import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#behave": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    name: "behave",
    typecheck: {
      tsconfig: "./tsconfig.json",
      checker: "tsc",
      enabled: true,
    },
  },
});
