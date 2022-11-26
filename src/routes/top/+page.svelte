<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	$: if (form?.type === 'validation_error' && browser) alert(form.message);
	let { pl, py, pm } = data.total ?? { pl: 0, py: 0, pm: 0 };
	let loading = false;
</script>

<div class="flex justify-center p-10">
	{#if data.loggedIn}
		<div class="bg-stone-700/50 p-10 flex flex-col gap-10 rounded items-center">
			<div>Oma ennätys: <b>{data.myscore ?? '0'}</b></div>
			<table>
				<tr>
					<th>Pisteet</th>
					<th>Nimi</th>
				</tr>
				{#each data.top as entry}
					<tr>
						<td>{entry.score}</td>
						<td>{entry.nick}</td>
					</tr>
				{/each}
			</table>

			<div class="flex flex-col gap-2 w-full">
				<h2 class="text-center text-xl mt-3 ">Yhteensä</h2>
				<div class="flex justify-around items-end border-y">
					<div
						style="height: {(pl / Math.max(pl, py, pm)) * 100}px;"
						class="bg-green-400/90 w-10"
					/>
					<div style="height: {(py / Math.max(pl, py, pm)) * 100}px;" class="bg-red-400/90 w-10" />
					<div style="height: {(pm / Math.max(pl, py, pm)) * 100}px;" class="bg-blue-400/90 w-10" />
				</div>
				<div class="flex justify-around">
					<div class:font-bold={data.linja === 'lulu'} class="text-green-200/90 w-10">LULU</div>
					<div class:font-bold={data.linja === 'yle'} class="text-red-200/90 w-10">YLE</div>
					<div class:font-bold={data.linja === 'melu'} class="text-blue-200/90 w-10">MELU</div>
				</div>
			</div>

			<form method="POST" class="flex gap-3" action="?/rename">
				<input
					type="text"
					name="nick"
					class="bg-stone-700/50 outline-none p-2 rounded"
					placeholder="Pelinimi"
					value={data.mynick ?? ''}
				/>
				<input type="submit" class="cursor-pointer" value="💾" />
			</form>

			{#if data.admin_url}
				<a class="underline-offset-4 underline" href={data.admin_url}>Go to admin</a>
			{/if}
		</div>
	{:else if form?.type === 'check_email'}
		<div class="bg-stone-700/50 p-5 text-xl rounded ">{form.message}</div>
	{:else if loading}
		<div class="bg-stone-700/50 p-5 text-xl rounded ">...</div>
	{:else}
		<form
			class="bg-stone-700/50 flex flex-col gap-2 rounded p-5"
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<label for="email" class="text-xl">Sähköposti:</label>
			<input
				placeholder="xd1234@edu.turku.fi"
				type="email"
				name="email"
				class="text-black p-2 rounded"
			/>
			<div class="flex justify-around">
				<div>
					<input type="radio" id="lulu" name="linja" value="lulu" />
					<label for="lulu">LULU</label>
				</div>
				<div>
					<input type="radio" id="yle" name="linja" value="yle" />
					<label for="yle">YLE</label>
				</div>
				<div>
					<input type="radio" id="melu" name="linja" value="melu" />
					<label for="melu">MELU</label>
				</div>
			</div>

			<input
				type="submit"
				class="bg-stone-700/50 p-2 rounded cursor-pointer hover:bg-stone-700/80"
				value="Kirjaudu"
			/>
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
