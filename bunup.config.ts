import { defineWorkspace } from "bunup";
import { copy } from "bunup/plugins";

export default defineWorkspace(
  [
    {
      name: "@prj-conq/behave",
      root: "packages/behave",
      config: {
        entry: "src/index.ts",
        plugins: [
          copy(
            "src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
          ).to(
            "dist/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
          ),
        ],
      },
    },
    {
      name: "@prj-conq/lib",
      root: "packages/lib",
      config: {
        entry: [
          "src/generics/index.ts",
          "src/patterns/index.ts",
          "src/processes/index.ts",
        ],
      },
    },
  ],
  {
    format: "esm",
    sourcemap: "linked",
    outDir: "dist",
    exports: true,
  },
);
