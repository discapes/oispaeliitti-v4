<script lang="ts">
	import { onMount } from 'svelte';

	let name = 'world';
	let text: string;

	onMount(() => {
		document.addEventListener('paste', (e) => {
			text = e.clipboardData!.getData('text');
			text = [...'123456']
				.map((n) => {
					const start = text.indexOf(` :${n}:`) + 4 + 1;
					const end = text.indexOf(' ', start);
					return n + `: ` + text.slice(start, end);
				})
				.join('\n');
		});
	});
</script>

<div class="bg-dark flex items-center justify-center flex-col p-10 m-10">
	<h1>Hello {name}!</h1>
	<pre>{text}</pre>
</div>
