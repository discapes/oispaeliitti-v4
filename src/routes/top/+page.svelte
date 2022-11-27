<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	$: if (form?.type === 'validation_error' && browser) alert(form.message);
	$: if (data.mymsg && browser) {
		alert(data.mymsg);
		fetch('?/readmsg', {
			method: 'POST',
			body: new FormData()
		});
	}

	let { pl, py, pm } = data.total ?? { pl: 0, py: 0, pm: 0 };
	let loading = false;

	function sanitizeHexColor(color: string) {
		if (
			color.length === 7 &&
			color[0] === '#' &&
			[...color.slice(1)].every((c) => '0123456789aAbBcCdDeEfF'.includes(c))
		)
			return color;
		return null;
	}

	let feedbackModal = false;
	// function feedback() {
	// 	const feedback = prompt('Palaute?');
	// 	if (feedback) {
	// 		const fd = new FormData();
	// 		fd.append("feedback")
	// 		fetch('?/feedback', {
	// 		method: 'POST',
	// 		body: fd
	// 	});
	// 	}
	// }
</script>

<div class="flex justify-center p-10">
	{#if data.loggedIn}
		<div class="bg p-10 flex flex-col gap-10 rounded items-center">
			<div>Oma ennätys: <b>{data.myscore ?? '0'}</b></div>
			<table class="bg">
				<tr>
					<th>Pisteet</th>
					<th>Nimi</th>
				</tr>
				{#each data.top as entry}
					<tr>
						<td>{entry.score}</td>
						<td style="color: {entry.color ? sanitizeHexColor(entry.color) : 'white'}">
							{entry.nick}
						</td>
					</tr>
				{/each}
			</table>

			<div class="flex flex-col gap-2 w-full">
				<h2 class="text-center text-xl mt-3 ">Kaikki pelit</h2>
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

			<form method="POST" class="flex gap-3" action="?/rename" use:enhance>
				<input
					type="text"
					name="nick"
					class="bg outline-none p-2 rounded border"
					placeholder="Pelinimi"
					value={data.mynick ?? ''}
				/>
				<input type="submit" class="cursor-pointer" value="💾" />
			</form>

			<button on:click={() => (feedbackModal = true)} class="button"> Lähetä palautetta </button>
			{#if feedbackModal}
				<div class="modal flex items-center justify-center">
					<div class="bg-dark relative w-[400px] p-5 flex flex-col gap-5 items-start rounded">
						<button
							type="button"
							on:click={() => (feedbackModal = false)}
							class="absolute right-5 top-5 text-2xl leading-[15px]"
							>&times;
						</button>
						<h1 class="my-0">Palaute</h1>
						<form
							action="?/feedback"
							class="contents"
							method="POST"
							use:enhance={() =>
								async ({ result, update }) => {
									feedbackModal = false;
									await update();
									alert('Palautteeseesi pyritään vastaamaan mahdollisimman pian.');
								}}
						>
							<textarea
								required
								class="bg p-1 w-full resize-y border outline-none rounded"
								type="textarea"
								name="text"
								rows="4"
							/>
							<input class="button" value="Lähetä" type="submit" />
						</form>
					</div>
				</div>
			{/if}
			{#if data.admin_url}
				<a class="underline-offset-4 underline" href={data.admin_url}>Go to admin</a>
			{/if}
		</div>
	{:else if form?.type === 'check_email'}
		<div class="bg p-5 text-xl rounded ">{form.message}</div>
	{:else if loading}
		<div class="bg p-5 text-xl rounded ">...</div>
	{:else}
		<form
			class="bg flex flex-col gap-2 rounded p-5"
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
				class="bg p-2 rounded cursor-pointer hover:bg-stone-700/80"
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
	.modal {
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0, 0, 0); /* Fallback color */
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
	}
</style>
