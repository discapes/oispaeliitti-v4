<script>
	import { P_MAX_TILE } from '$env/static/public';
	import { browser, dev, prerendering } from '$app/environment';

	export let grid;
	let tileContainer;

	$: update(grid);

	function update(grid) {
		if (browser)
			window.requestAnimationFrame(() => {
				while (tileContainer.firstChild) tileContainer.removeChild(tileContainer.firstChild);
				for (let col of grid.cells) for (let cell of col) if (cell) drawTile(cell);
			});
	}

	function drawTile(tile) {
		const position = tile.previousPosition || { x: tile.x, y: tile.y };

		const wrapper = document.createElement('div');
		wrapper.classList.add('tile', 'tile-' + Math.min(P_MAX_TILE, tile.value));
		wrapper.style.transform = `translate(${125 * position.x}px, ${125 * position.y}px)	`;

		const inner = document.createElement('div');
		inner.classList.add('tile-inner');
		inner.style.backgroundImage = `url("/img/${tile.value}.png")`;

		if (tile.previousPosition) {
			// Make sure that the tile gets rendered in the previous position first
			window.requestAnimationFrame(
				() => (wrapper.style.transform = `translate(${125 * tile.x}px, ${125 * tile.y}px)`)
			);
		} else if (tile.mergedFrom) {
			wrapper.classList.add('tile-merged');
			// Render the tiles that merged
			tile.mergedFrom.forEach(drawTile);
		} else {
			wrapper.classList.add('tile-new');
		}

		wrapper.appendChild(inner);
		tileContainer.appendChild(wrapper);
	}
</script>

<div class="absolute z-10 translate-y-[16px] translate-x-[16px]" bind:this={tileContainer} />
<div
	class="grid grid-flow-col gap-[15px] p-4 bg-black/10 rounded"
	style={`grid-template-rows: repeat(${grid.sizey}, minmax(0, 1fr)); grid-template-columns: repeat(${grid.sizex}`}
>
	{#each { length: grid.sizex * grid.sizey } as _}
		<div class="min-h-[110px] min-w-[110px] bg-black/20 rounded" />
	{/each}
</div>

<style global>
	.tile,
	.tile .tile-inner {
		width: 110px;
		height: 110px;
		overflow: hidden;
	}

	.tile {
		color: rgba(0, 0, 0, 0);
		position: absolute;
		transition: 100ms ease-in-out;
		transition-property: transform;
	}

	.tile .tile-inner {
		border-radius: 3px;
		background: #eee4da;
		text-align: center;
		font-weight: bold;
		z-index: 10;
		background-size: cover;
		box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0), inset 0 0 0 1px rgba(255, 255, 255, 0);
	}

	.tile-new .tile-inner {
		animation: appear 200ms ease 100ms;
		animation-fill-mode: backwards;
	}

	.tile.tile-4096 {
		border-radius: 3px;
		background-size: cover;

		background: linear-gradient(
				rgba(255, 0, 0, 1) 0%,
				rgba(255, 154, 0, 1) 10%,
				rgba(208, 222, 33, 1) 20%,
				rgba(79, 220, 74, 1) 30%,
				rgba(63, 218, 216, 1) 40%,
				rgba(47, 201, 226, 1) 50%,
				rgba(28, 127, 238, 1) 60%,
				rgba(95, 21, 242, 1) 70%,
				rgba(186, 12, 248, 1) 80%,
				rgba(251, 7, 217, 1) 90%,
				rgba(255, 0, 0, 1) 100%
			)
			0 0/100% 800%;
		animation: a 4s linear infinite;
	}

	.tile.tile-4096 .tile-inner {
		border-radius: 3px;
	}

	@keyframes a {
		to {
			background-position: 0 -200%;
		}
	}

	@keyframes appear {
		0% {
			opacity: 0;
			-webkit-transform: scale(0);
			-moz-transform: scale(0);
			transform: scale(0);
		}

		100% {
			opacity: 1;
			-webkit-transform: scale(1);
			-moz-transform: scale(1);
			transform: scale(1);
		}
	}

	@keyframes pop {
		0% {
			-webkit-transform: scale(0);
			-moz-transform: scale(0);
			transform: scale(0);
		}

		50% {
			-webkit-transform: scale(1.5);
			-moz-transform: scale(1.5);
			transform: scale(1.5);
		}

		100% {
			-webkit-transform: scale(1);
			-moz-transform: scale(1);
			transform: scale(1);
		}
	}

	.tile-merged .tile-inner {
		z-index: 20;
		animation: pop 200ms ease 100ms;
		animation-fill-mode: backwards;
	}
</style>
