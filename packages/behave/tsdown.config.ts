import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  platform: "node",
  dts: {
    oxc: true,
    compilerOptions: {
      removeComments: true,
    },
  },
  format: ["esm"],
  clean: ["dist", "coverage"],
  sourcemap: true,
  minify: false,
});
