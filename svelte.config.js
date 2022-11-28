import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		replace: [[/__VERCEL_ANALYTICS_ID__/g, process.env.VERCEL_ANALYTICS_ID]]
	}),

	kit: {
		adapter: adapter(),
		env: {
			publicPrefix: 'P_'
		}
	}
};

export default config;
