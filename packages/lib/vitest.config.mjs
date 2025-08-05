import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "#lib": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    name: "lib",
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
