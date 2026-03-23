import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
	name: "@prj-conq/lizard-ts",
	entry: "src/index.ts",
	outDir: "dist",
	exports: true,
	format: "esm",
	sourcemap: "linked",
	plugins: [
		copy("src/python-lizard").to("python-lizard").with({ followSymlinks: true }),
	],
});
