import { defineConfig } from "bunup";

export default defineConfig({
  name: "@prj-conq/charts",
  entry: [
    "src/index.ts",
    "src/generic/index.ts",
    "src/domain/index.ts",
  ],
  outDir: "dist",
  dts: false,
  format: "esm",
  sourcemap: "linked",
});
