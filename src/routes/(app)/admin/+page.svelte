<script lang="ts">
	import { browser } from '$app/environment';
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import EditField from './EditField.svelte';
	import Table from './Table.svelte';

	export let data: PageData;
	export let form: ActionData;
	$: if (form?.type === 'validation_error' && browser) alert(form.message);

	async function unblock(emailOrNick: string, name: 'un_email' | 'un_nick') {
		const fd = new FormData();
		fd.append(name, emailOrNick);
		const response = await fetch('?/block', {
			method: 'POST',
			body: fd
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<div class="flex justify-start p-10 gap-5 flex-wrap">
	<div class="bg p-5">
		<h1>Käyttäjät</h1>
		<div class="bg">
			<Table data={data.leaderboard} />
		</div>
	</div>

	<div class="bg p-5 flex flex-col gap-2">
		<h1>Kielletyt nimet</h1>
		<form action="?/block" method="POST" use:enhance>
			<input class="bg p-1 border outline-none" name="nick" />
			<input class="button" type="submit" />
		</form>
		<div class="flex gap-3 flex-wrap w-[400px]">
			{#each data.blockedNicks as nick}
				<div on:click={() => unblock(nick, 'un_nick')} class="button">{nick}</div>
			{/each}
		</div>
	</div>

	<div class="bg p-5 flex flex-col gap-2">
		<h1 class="relative">
			Estetyt sähköpostit
			<span class="absolute text-base -bottom-5 left-0">(nimenvaihdosta)</span>
		</h1>
		<form action="?/block" method="POST" use:enhance>
			<input class="bg p-1 border outline-none" name="email" />
			<input class="button" type="submit" />
		</form>
		<div class="flex gap-3 flex-wrap w-[400px]">
			{#each data.blockedEmails as email}
				<div on:click={() => unblock(email, 'un_email')} class="button">{email}</div>
			{/each}
		</div>
	</div>

	<div class="bg p-5 flex flex-col">
		<form action="?/edit" class="contents" method="POST" use:enhance>
			<h1 class="relative">
				Muokkaa
				<span class="absolute text-base -bottom-5 left-0">(tyhjä arvo poistuu)</span>
			</h1>
			<label for="rename_email">Sähköposti:</label>
			<input
				id="rename_email"
				name="email"
				type="email"
				class="bg p-1 border outline-none mb-5"
				placeholder="xd1234@edu.turku.fi"
			/>
			<label for="editField">Kenttä:</label>
			<select name="field" id="edit_field" class="mb-5 button">
				<option class="button" value="nick">Nimi</option>
				<option class="button" value="color">Väri</option>
				<option class="button" value="score">Pisteet</option>
				<option class="button" value="msg">Viesti</option>
			</select>
			<label for="edit_new_value">Uusi arvo:</label>
			<input id="edit_new_value" name="new_value" class="bg p-1 border outline-none mb-5" />
			<input class="button" type="submit" />
		</form>
	</div>

	<div class="bg p-5">
		<h1>Linjat</h1>
		<div class="bg p-3 grid grid-cols-2 gap-3 gap-x-6 w-[250px]">
			<span>LULU</span>
			<EditField action="?/editlinjascore" name="lulu" value={data.linjat.lulu} />
			<span>YLE</span>
			<EditField action="?/editlinjascore" name="yle" value={data.linjat.yle} />
			<span>MELU</span>
			<EditField action="?/editlinjascore" name="melu" value={data.linjat.melu} />
		</div>
	</div>
</div>

<style>
	h1 {
		margin-top: 0;
		margin-bottom: 30px;
	}
</style>
