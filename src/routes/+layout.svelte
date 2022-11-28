<script lang="ts">
	import './tailwind.css';
	import './normalize.css';
	import { browser } from '$app/environment';
	import { webVitals } from '$lib/vitals';
	import { page } from '$app/stores';
	import { inject } from '@vercel/analytics';

	let analyticsId = '__VERCEL_ANALYTICS_ID__';

	$: if (browser && analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId
		});
	}

	$: if(browser) inject();
</script>

<slot />
