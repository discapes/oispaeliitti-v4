<script lang="ts">
	import type { PageData } from './$types';
	import Table from './Table.svelte';

	export let data: PageData;

	let blocked: string[] = [];
</script>

<div class="flex justify-center p-10 gap-5">
	<div class="bg-stone-700/50 p-5">
		<h1 class="mt-0">users</h1>
		<div class="bg-stone-700/50">
			<Table data={data.leaderboard} />
		</div>
	</div>
	<div class="bg-stone-700/50 p-5 flex flex-col gap-2">
		<h2>blocked nicknames (partial)</h2>
		<input
			class="bg-stone-700/50 p-1 border outline-none"
			on:keydown={(e) => {
				if (e.key == 'Enter' && e.target.value) {
					blocked = [...blocked, e.target.value];
					e.target.value = '';
				}
			}}
		/>
		<div class="flex gap-3 flex-wrap w-[400px]">
			{#each blocked as word}
				<div class="border p-1 bg-stone-700/50">{word}</div>
			{/each}
		</div>
	</div>
	<div class="bg-stone-700/50 p-5 flex flex-col gap-2">
		<h2>blocked emails from setting nickname (partial)</h2>
		<input
			class="bg-stone-700/50 p-1 border outline-none"
			on:keydown={(e) => {
				if (e.key == 'Enter' && e.target.value) {
					blocked = [...blocked, e.target.value];
					e.target.value = '';
				}
			}}
		/>
		<div class="flex gap-3 flex-wrap w-[400px]">
			{#each blocked as word}
				<div class="border p-1 bg-stone-700/50">{word}</div>
			{/each}
		</div>
	</div>
	<div class="bg-stone-700/50 p-5 flex flex-col gap-2">
		<form action="?/rename" class="contents" method="POST">
			Change nickname for
			<input
				name="email"
				class="bg-stone-700/50 p-1 border outline-none"
				placeholder="Full email"
			/>
			<input
				name="nick"
				class="bg-stone-700/50 p-1 border outline-none"
				placeholder="New nickname"
			/>
			Submit empty to set to null
		</form>
	</div>
</div>
