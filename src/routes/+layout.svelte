<script lang="ts">
	import './tailwind.css';
	import './normalize.css';
	import { browser } from '$app/environment';
	import { webVitals } from '$lib/vitals';
	import { page } from '$app/stores';

	let analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;
	console.log(analyticsId);

	$: if (browser && analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId
		});
	}
</script>

<slot />
