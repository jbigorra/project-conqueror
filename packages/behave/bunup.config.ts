import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
	name: "@prj-conq/behave",
	entry: "src/index.ts",
	outDir: "dist",
	dts: { inferTypes: true },
	exports: true,
	format: "esm",
	sourcemap: "linked",
	plugins: [
		copy(
			"src/legacy/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
		).to("infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar"),
	],
});
