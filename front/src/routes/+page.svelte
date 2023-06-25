<script lang="ts">
	import { onMount } from 'svelte';
	import './utils';

	import { runGame, type Game } from './game';
	import type { CellColor, GameField, TurnError, UiCallbacks } from './types';
	import { DEBUG } from './constants';

	let board: HTMLDivElement;
	let game: Game;
	let tossedValues: number[] | null = null;

	$: debugGameField = null as GameField | null;
	$: error = null as TurnError | null;
	$: turn = null as CellColor | null;

	$: showBanner = false;

	function startTurnHandler(color: CellColor) {
		turn = color;
		console.log('start turn', color);
		tossedValues = null;
		error = null;

		showBanner = true;

		console.log({ showBanner });

		setTimeout(() => {
			showBanner = false;
		}, 3000);
	}

	const uiCallbacks: UiCallbacks = {
		startTurn: startTurnHandler
	};

	onMount(() => {
		game = runGame(board, uiCallbacks);

		turn = game._gameField.turn;

		showBanner = true;

		setTimeout(() => {
			showBanner = false;
		}, 3000 + 500);
	});

	function toss() {
		if (!game) {
			console.error('game is not initialized');
			return;
		}

		let [newError, newTossedValue] = game.toss();
		debugGameField = game._gameField;

		if (newError) {
			error = newError;
			return;
		}

		tossedValues = newTossedValue;

		console.log('toss', tossedValues);
	}
</script>

<h1>Nardi</h1>

<div class="row">
	<div>
		<div class="board-container">
			<div bind:this={board} />
			{#if showBanner}
				<div class="turn-banner">{turn} turn</div>
			{/if}
		</div>
		{#if turn}
			<div>turn: {turn}</div>
		{/if}
		<div class="row">
			<button on:click={toss}>toss</button>
			{#if tossedValues}
				{#each tossedValues as value}
					<div class="dice">{value}</div>
				{/each}
			{/if}
		</div>
		{#if error}
			<div>{error}</div>
		{/if}
	</div>
	{#if DEBUG}
		<code>
			<pre>
				{#if debugGameField}
					{JSON.stringify({ ...debugGameField, cells: '[redacted]' }, null, 2)}
				{/if}
			</pre>
		</code>
	{/if}
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;

		gap: 1rem;
	}

	.board-container {
		position: relative;
	}

	.turn-banner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		/* text-align: center; */
		display: grid;
		place-items: center;

		font-size: 3rem;
		letter-spacing: 0.3rem;
		opacity: 0;

		pointer-events: none;

		/* with delay */
		animation: turn-banner 3s ease-in-out;
	}

	/* animation that creates a big banner with 0 opacity and turns it to normal */
	@keyframes turn-banner {
		0% {
			opacity: 0;
			transform: scale(3);
		}
		20%,
		80% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(3);
		}
	}
</style>
