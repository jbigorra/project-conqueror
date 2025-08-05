import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#behave": path.resolve(__dirname, "./src"),
      "#infra": path.resolve(__dirname, "./src/infrastructure"),
      "#runners": path.resolve(__dirname, "./src/runners"),
      "#analyses": path.resolve(__dirname, "./src/analyses"),
    },
  },
  test: {
    name: "behave",
    typecheck: {
      tsconfig: "./tsconfig.json",
      checker: "tsc",
      enabled: true,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "node_modules/",
        "tests/",
        "dist/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.config.{ts,js,cjs,mjs}",
      ],
    },
  },
});
