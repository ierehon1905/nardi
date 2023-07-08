<script lang="ts" context="module">
	// neffos.dial2 = neffos.dial;
</script>

<script lang="ts">
	import { DEBUG } from '$lib/constants';

	import { onMount, onDestroy } from 'svelte';
	import './utils';

	import { runGame, type Game } from '$lib/engine/game';
	import type { CellColor, GameField, TurnError, UiCallbacks } from '../lib/engine/types';
	// import type { PollGameResponse, UserSession } from '../lib/api/types';
	import Flex from '$lib/components/Flex.svelte';
	import Text from '$lib/components/Text.svelte';

	let board: HTMLDivElement;
	let game: Game;
	let tossedValues: number[] | null = null;

	let debugGameField = null as GameField | null;
	let error = null as TurnError | null;
	let turn = null as CellColor | null;
	let showBanner = false;
	let activeUsersCount = 0;

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

	onMount(async () => {
		game = runGame(board, uiCallbacks);

		turn = game._gameField.turn;

		showBanner = true;

		setTimeout(() => {
			showBanner = false;
		}, 3000 + 500);

		// const gameChannel = client.channel('game', {
		// 	config: {
		// 		broadcast: {
		// 			ack: true,
		// 			self: false
		// 		}
		// 	}
		// });

		// gameChannel.on('broadcast', { event: 'test' }, (data) => {
		// 	console.log('on broadcast test', data);
		// });

		// gameChannel.subscribe((data) => {
		// 	console.log('subscribe test', data);
		// 	if (data === 'SUBSCRIBED') {
		// 		gameChannel.send({
		// 			type: 'broadcast',
		// 			event: 'test',
		// 			payload: 'test'
		// 		});
		// 	}
		// });
	});

	onDestroy(() => {});

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

	let userEmail = 'Loading...';
	let anonymousUserId: string | undefined = undefined;

	onMount(async () => {
		// const res = await client.auth.getUser();
		// if (res.error) {
		// 	userEmail = 'Anonymous';
		// 	anonymousUserId = crypto.randomUUID();
		// 	return;
		// }
		// userEmail = res.data.user?.email || 'Not logged in';
	});

	function findGame() {
		// const res = client.realtime.channel('');
	}
</script>

<Flex direction="row" justify="space-between">
	<h1>Nardi</h1>
	<Text>
		{userEmail}
	</Text>
</Flex>

<div class="row center">
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
		<Flex direction="row">
			<button on:click={toss}>toss</button>
			{#if tossedValues}
				{#each tossedValues as value}
					<div class="dice">{value}</div>
				{/each}
			{/if}
		</Flex>
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
	<Flex>
		<div>active users: {activeUsersCount}</div>
		<button on:click={findGame}>Find game</button>
	</Flex>
</div>

<style lang="scss">
	.row {
		display: flex;
		flex-direction: row;

		gap: 1rem;

		&.center {
			gap: unset;
			justify-content: center;
		}
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
