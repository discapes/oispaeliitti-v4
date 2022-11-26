<script lang="ts">
	import Grid from './Grid.svelte';
	import GameGrid from './game.js';
	import { P_INITIAL_MOTICOSTS } from '$env/static/public';
	import { URLS } from '$lib/urls';

	let score = 0;
	let moti = 0;
	let motiCost = calcMotiCost(0);
	let katkoja = 0;
	let grid: GameGrid;

	(function startGame() {
		score = 0;
		moti = 0;
		motiCost = calcMotiCost(0);
		katkoja = 0;

		grid = new GameGrid(4, 4, {
			onWin() {
				fetch(URLS.POSTSCORE, {
					method: 'POST',
					body: score.toString()
				});
			},
			onLoss() {
				fetch(URLS.POSTSCORE, {
					method: 'POST',
					body: score.toString()
				});
				alert(`Hävisit pisteillä ` + score + '!');
				startGame();
			},
			onAddScore(add: number) {
				score += add;
				moti += add;
			}
		});
	})();

	function tryKoeviikko() {
		if (moti >= motiCost) {
			moti -= motiCost;
			motiCost = calcMotiCost(++katkoja);
			grid.katkoReissu();
			grid = grid;
			return true;
		} else {
			return false;
		}
	}

	function calcMotiCost(n: number) {
		if (n < 5) return +P_INITIAL_MOTICOSTS.split(',')[n]; //50 * x^2 - (50 * x) + 1000;
		else return 500 * (n + 1) ** 2 - 4500 * (n + 1) + 12000; // (2000), 3000, 5000, 8000, 12000
	}

	function handleKd(e: KeyboardEvent) {
		switch (e.key.toLowerCase()) {
			case 'arrowup':
			case 'w':
				grid.move(0);
				break;
			case 'arrowleft':
			case 'a':
				grid.move(3);
				break;
			case 'arrowdown':
			case 's':
				grid.move(2);
				break;
			case 'arrowright':
			case 'd':
				grid.move(1);
				break;
			default:
				return;
		}
		grid = grid;
	}
</script>

<svelte:head>
	<link rel="prefetch" href="/img/2.png" />
	<link rel="prefetch" href="/img/4.png" />
	<link rel="prefetch" href="/img/8.png" />
	<link rel="prefetch" href="/img/16.png" />
	<link rel="prefetch" href="/img/32.png" />
	<link rel="prefetch" href="/img/64.png" />
	<link rel="prefetch" href="/img/128.png" />
	<link rel="prefetch" href="/img/256.png" />
	<link rel="prefetch" href="/img/512.png" />
	<link rel="prefetch" href="/img/1024.png" />
	<link rel="prefetch" href="/img/2048.png" />
	<link rel="prefetch" href="/img/4096.png" />
</svelte:head>
<svelte:window on:keydown={handleKd} />

<section class="flex justify-center">
	<div class="flex flex-col">
		<div class="flex gap-7 p-3">
			<h1 class="tracking-widest font-thin">Oispa Eliitti</h1>
			<div class="box grow rounded flex flex-col justify-around gap-3">
				<p>Moti: <span class="font-bold">{moti}</span></p>
				<p>Pisteet: <span class="font-bold">{score}</span></p>
			</div>
			<button
				class="text-center"
				disabled={moti < motiCost}
				class:bg-lime-200={moti >= motiCost}
				on:click={tryKoeviikko}
				><p>Koeviikko</p>
				({motiCost})</button
			>
		</div>
		<div class="inline-flex">
			<Grid {grid} />
		</div>
		<div class="flex gap-3 p-3 rounded" />
	</div>
</section>

<style>
	button,
	.box {
		background-color: rgba(245, 245, 245, 0.8);
		color: #101010;
		@apply rounded p-3 shadow-lg drop-shadow-lg border-2 border-black/80;
	}
	button {
		background-color: rgba(245, 245, 245, 0.8);
	}
	button:hover:not([disabled]) {
		background-color: rgb(234, 234, 234);
	}
</style>
