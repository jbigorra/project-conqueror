import adapter from "@sveltejs/adapter-auto";
import type { Config } from "@sveltejs/kit";

const config: Config = {
  kit: {
    adapter: adapter(),
  },
  compilerOptions: {
    runes: true,
  },
  vitePlugin: {
    dynamicCompileOptions: ({ filename }) => {
      return { runes: !filename.includes("node_modules") };
    },
  },
};

export default config;
