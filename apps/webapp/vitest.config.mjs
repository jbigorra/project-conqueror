// import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#package.json": path.resolve(__dirname, "./package.json"),
      "#src/*": path.resolve(__dirname, "./src/*"),
      "#shared/http/*": path.resolve(
        __dirname,
        "./src/shared/infrastructure/http/*",
      ),
      "#shared/server/*": path.resolve(
        __dirname,
        "./src/shared/infrastructure/server/*",
      ),
      "#shared/client/*": path.resolve(
        __dirname,
        "./src/shared/infrastructure/client/*",
      ),
      "#shared/ui/components/*": path.resolve(
        __dirname,
        "./src/shared/presentation/ui/components/*",
      ),
      "#shared/ui/partials/*": path.resolve(
        __dirname,
        "./src/shared/presentation/ui/partials/*",
      ),
      "#shared/ui/layouts/*": path.resolve(
        __dirname,
        "./src/shared/presentation/ui/layouts/*",
      ),
      "#upload/*": path.resolve(__dirname, "./src/features/upload/*"),
      "#analyses/*": path.resolve(__dirname, "./src/features/analyses/*"),
    },
  },
  test: {
    name: "webapp",
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
        "dist/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.config.{ts,js,cjs,mjs}",
      ],
    },
  },
  // test: {
  //   browser: {
  //     enabled: true,
  //     provider: "playwright",
  //     // https://vitest.dev/guide/browser/playwright
  //     instances: [
  //       { browser: "chromium" },
  //       { browser: "firefox" },
  //       { browser: "webkit" },
  //     ],
  //   },
  // },
});
