<script lang="ts" context="module">
	// neffos.dial2 = neffos.dial;
</script>

<script lang="ts">
	import { BACKEND_HOST, DEBUG } from '$lib/constants';
	import { onMount, onDestroy } from 'svelte';
	import './utils';

	import { runGame, type Game } from '$lib/engine/game';
	import type { CellColor, GameField, TurnError, UiCallbacks } from '../lib/engine/types';
	import type { PollGameResponse, UserSession } from './types';

	let board: HTMLDivElement;
	let game: Game;
	let tossedValues: number[] | null = null;

	let debugGameField = null as GameField | null;
	let error = null as TurnError | null;
	let turn = null as CellColor | null;
	let showBanner = false;
	let connection: neffos.Conn | null = null;
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

		const session = await fetch(`//${BACKEND_HOST}/api/user-session`, {
			method: 'POST',
			credentials: 'include'
		}).then<UserSession>((res) => {
			return res.json();
		});

		const websocketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';

		const conn = await neffos.dial(
			`${websocketProtocol}://${BACKEND_HOST}/api/ws`,
			{
				default: {
					[neffos.OnNamespaceConnected]: (nsConn, msg) => {
						console.log('connected to namespace: ', nsConn, msg);
					},
					[neffos.OnNamespaceDisconnect]: (nsConn, msg) => {
						console.log('disconnected from namespace: ', msg.Namespace, msg);
					},
					[neffos.OnRoomJoin]: (nsConn, msg) => {
						console.log('joined room: ', msg.Room, msg);
					},
					[neffos.OnRoomLeave]: (nsConn, msg) => {
						console.log('left room: ', msg.Room, msg);
					},
					'active-users': (nsConn, msg) => {
						const number = parseInt(msg.Body);

						if (isNaN(number)) {
							console.error('active-users: invalid number', msg.Body);
							return;
						}

						activeUsersCount = number;
					}
				}
			},
			{
				reconnect: 5000,
				headers: {
					'X-Username': 'leon'
				}
			}
		);

		conn.connect('default').then((nsConn) => {
			nsConn.ask('active-users', '').then((res) => {
				const number = parseInt(res.Body);

				if (isNaN(number)) {
					console.error('active-users: invalid number', res.Body);
					return;
				}

				activeUsersCount = number;
			});

			nsConn.ask('poll-game', '').then((res) => {
				const parsed = JSON.parse(res.Body) as PollGameResponse;
				nsConn.joinRoom(parsed.RoomID);
			});
		});

		connection = conn;

		fetch(`//${BACKEND_HOST}/api/ping`);
	});

	onDestroy(() => {
		if (connection) {
			console.log('close connection');

			connection.close();
		}
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
	<div>
		<div>active users: {activeUsersCount}</div>
	</div>
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
