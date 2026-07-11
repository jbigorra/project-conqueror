import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "td-radar",
		identifier: "td-radar.electrobun.dev",
		version: "0.0.1",
	},
	build: {
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/_app": "views/mainview/_app",
		},
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
