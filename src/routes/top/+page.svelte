<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	$: if (form?.message) alert(form.message);
</script>

<div class="flex justify-center p-10">
	{#if data.loggedIn}
		<div class="bg-stone-700/50 p-10 flex flex-col gap-5">
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
		<div class="bg-stone-700/50 p-10">Katso sähköpostisi. Voit sulkea tämän välilehden.</div>
	{:else}
		<form class="bg-stone-700/50 flex flex-col gap-3 rounded p-10" method="POST" use:enhance>
			<label for="email">Sähköposti</label>
			<input placeholder="..." type="email" name="email" class="text-black p-1" />
			<input type="submit" class="bg-stone-700/50 p-1" />
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
		padding: 5px;
	}
</style>
