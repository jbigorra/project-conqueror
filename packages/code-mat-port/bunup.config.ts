import { defineConfig } from "bunup";

export default defineConfig({
  name: "@prj-conq/code-mat-port",
  entry: "src/index.ts",
  outDir: "dist",
  exports: true,
  format: "esm",
  sourcemap: "linked",
});
