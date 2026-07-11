import adapter from '@sveltejs/adapter-static';
import type { Config } from '@sveltejs/kit';

const config: Config = {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist'
		}),
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
