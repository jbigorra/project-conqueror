import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  name: "@prj-conq/behave",
  entry: "src/index.ts",
  outDir: "dist",
  dts: false,
  noExternal: ["@prj-conq/code-maat-ts", "@prj-conq/lizard-ts", "@prj-conq/lib"],
  format: "esm",
  sourcemap: "linked",
  // preferredTsconfig: "tsconfig.build.json",
  plugins: [
    copy("src/legacy/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar").to(
      "infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
    ),
  ],
});
