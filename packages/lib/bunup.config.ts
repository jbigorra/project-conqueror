import { defineConfig } from "bunup";

export default defineConfig({
  name: "@prj-conq/lib",
  entry: ["src/generics/index.ts", "src/patterns/index.ts", "src/processes/index.ts"],
  outDir: "dist",
  exports: true,
  format: "esm",
  sourcemap: "linked",
});
