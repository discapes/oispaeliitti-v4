<script lang="ts">
	import { onMount } from 'svelte';

	let palkit: string[] = [];
	$: text = palkit.map((c, i) => `${i + 1}: ${c}`).join('\n');

	let textfield: string;

	function parse(data: string) {
		palkit = [...'123456'].map((n) => {
			const start = data.indexOf(` :${n}:`) + 4 + 1;
			const end = data.indexOf(' ', start);
			return data.slice(start, end);
		});
		setTimeout(() => {
			textfield = '';
		}, 0);
	}

	onMount(() => {
		document.addEventListener('paste', (e) => {
			const data = e.clipboardData!.getData('text');
			localStorage.setItem('rkv-data', data);
			parse(data);
		});
		if (localStorage.getItem('rkv-data')) parse(localStorage.getItem('rkv-data')!);
	});

	const rkv = [
		[
			'MAA02.2 KE03.4  wTSYÄI11.4 TE03',
			'ENA05.3 wTSYENA9.5a wTSYENA9.5b KU01.5 FI02.3',
			'wTSYRUB19.4 MAA04.6 RUB12.2h RUA02.1',
			'wMAA14.4 BI02.4 wÄI09.5',
			'TSYLI06.2 PS01.5',
			'YH01.5 YH03.3 ÄI06.3 TSYFY10.4'
		],
		[
			'RUA05.1 KE03.3 ÄI06.2 wFY08.3',
			'FI01.4 wPS06.2 MU01.6 wBI06.2',
			'HI03.4 HI01.5 TE01.7',
			'MAB05.1 wTSYHI7.2 wMAA14.3',
			'KE01.6 RUB12.6b MAA02.6 TSYFY10.3',
			'wTSYRUB19.3 wBI06.3 TSYLI06.1 wÄI09.4'
		],
		[
			'TSYKE08 TSYÄI13 KE03.5 wTSYEAB39',
			'wTSYENA10.5 MAA02.7 GE01.6 KU01.6',
			'YH01.6 BI01.7 wMAA14.5 ÄI06.4',
			'wTSYENA9.6a ENA05.4 wÄI09.6 MAB02',
			'RUA05.2 ÄI06.4 UE01.4',
			'TSYLI06.3 wTSYENA9.6b'
		],
		[
			'MAA02.2 KE03.4 wTSYÄI11.4 TE03',
			'ENA05.3 wTSYENA9.5a wTSYENA9.5a KU01.5 FI02.3',
			'wTSYRUB19.4 RUB12.2h RUA02.1',
			'wMAA14.4 BI02.4 wÄI09.5',
			'TSYLI06.2 PS01.5',
			'YH01.5 YH03.3 ÄI06.3 TSYFY10.4'
		],
		[
			'RAB32 TSYKE07 wKE06.2 wTE04.2',
			'wÄI09.3 ÄI06.1 ENA05.2',
			'MAA04.6 BI04.3 MAA04.5 FY01.8 UE02.4',
			'BI03.3 PS01.4 RUB12.5 SAB24',
			'MAA02.5 wMAA14.2 wGE05.2 Wue07',
			'wTSYYH5.2 YH01.4 FY03.2 HI02.6'
		]
	];

	const palkkiOrder = [...'54653'].map((f) => +f);
	const weekdays = `MA,TI,KE,TO,PE`.split(',');
	const times = [
		'11.15 - 11.45',
		'11.45 - 12.15',
		'12.00 - 12.30',
		'12.15 - 12.45',
		'12.30 - 13.00',
		'12.45 - 13.15'
	];

	// for (let y = 0; y < rkv.length; y += 2) {
	// 	rkv2.push(rkv[y].map((_, i) => `${rkv[y][i]} ${rkv[y + 1][i]}`));
	// }
	// let rkv2 = [];
	//PIVOT
	// for (let d = 0; d < rkv[0].length; d++) {
	// 	rkv2.push([]);
	// 	for (let t = 0; t < rkv.length; t++) {
	// 		rkv2[d][t] = rkv[t][d];
	// 	}
	// }
</script>

<svelte:head>
	<title>Ruokavuorot</title>
</svelte:head>

<div class="bg-sky-400 p-10 min-h-screen overflow-auto">
	<div class="inline-flex flex-col items-center min-w-full">
		<div class="p-10 md:px-32 bg-sky-200 text-neutral-800">
			<h1>TSYK jakso 3 ruokavuorot</h1>
			<p class="m-5 max-w-[400px] min-w-[200px]">
				Etsi Wilman lukujärjestyksestä ensimmäinen kokonainen viikko, kopio kaikki painamalla
				<code>CTRL + A</code> ja <code>CTRL + C</code> (tai puhelimella <code>Valitse kaikki</code>
				ja <code>Kopioi</code>) ja liitä se tänne painamalla
				<code>CTRL + V</code> (tai puhelimella <code>Liitä</code> seuraavaan kentään). Muista
				kirjanmerkitä tämä sivusto!
				<br />
				<input bind:value={textfield} type="text" class="m-3" />
			</p>
			{#if text}
				<div class="bg-white/20 p-5 flex justify-center">
					<!-- <pre>{text}</pre> -->
					<table>
						<tr>
							<th class="font-bold">Päivä</th>
							<th class="font-bold">Kurssi</th>
							<th class="font-bold">#</th>
							<th class="font-bold">Aika</th>
						</tr>
						{#each weekdays as wd, i}<tr>
								<td>{wd}</td>
								<td>{palkit[palkkiOrder[i] - 1]}</td>
								<td>
									{rkv[i].findIndex((group) => group.includes(palkit[palkkiOrder[i] - 1])) + 1}
								</td>
								<td class="whitespace-nowrap">
									{times[rkv[i].findIndex((group) => group.includes(palkit[palkkiOrder[i] - 1]))]}
								</td>
							</tr>
						{/each}
					</table>
					<!-- <pre class="whitespace-pre-wrap">{JSON.stringify(rkv, null, 2)}</pre> -->
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	table tr td,
	table tr th {
		padding: 5px 20px;
	}
	code {
		white-space: nowrap;
		padding: 0px 5px;
		display: inline-block;
		@apply bg-sky-100 rounded;
	}
</style>
