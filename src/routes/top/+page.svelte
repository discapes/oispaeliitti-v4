<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	$: if (form?.message) alert(form.message);
</script>

<div class="flex justify-center p-10">
	{#if data.loggedIn}
		<div class="bg-stone-700/50 p-10 flex flex-col gap-5 rounded">
			<table>
				<tr>
					<th>Pisteet</th>
					<th>Nimi</th>
				</tr>
				{#each data.top as entry}
					<tr>
						<td>{entry.score}</td>
						<td>{entry.value}</td>
					</tr>
				{/each}
			</table>

			<table>
				<tr>
					<td>{data.myscore}</td>
					<td>{data.email}</td>
				</tr>
			</table>
		</div>
	{:else if form?.success}
		<div class="bg-stone-700/50 p-5 text-xl rounded ">
			Katso sähköpostisi. Voit sulkea tämän välilehden.
		</div>
	{:else}
		<form class="bg-stone-700/50 flex flex-col gap-2 rounded p-5" method="POST" use:enhance>
			<label for="email" class="text-xl">Sähköposti:</label>
			<input
				placeholder="xd1234@edu.turku.fi"
				type="email"
				name="email"
				class="text-black p-2 rounded"
			/>
			<input type="submit" class="bg-stone-700/50 p-2 rounded" value="Kirjaudu" />
		</form>
	{/if}
</div>

<style>
	table tr td,
	table tr th {
		padding: 10px;
	}
	table {
		border: white solid 1px;
		border-width: 1px;
		padding: 5px;
	}
</style>
