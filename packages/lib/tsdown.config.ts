import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "generics/index": "./src/generics/index.ts",
    "patterns/index": "./src/patterns/index.ts",
    "processes/index": "./src/processes/index.ts",
  },
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
