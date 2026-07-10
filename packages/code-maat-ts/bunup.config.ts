import { defineConfig } from "bunup";

export default defineConfig({
  name: "@prj-conq/code-maat-ts",
  entry: "src/index.ts",
  outDir: "dist",
  exports: true,
  format: "esm",
  sourcemap: "linked",
});
