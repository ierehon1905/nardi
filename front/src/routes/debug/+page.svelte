<script lang="ts">
	import { api } from '$lib/api';
	import Flex from '$lib/components/Flex.svelte';
	import Text from '$lib/components/Text.svelte';
	import { client } from '$lib/neffos/client';
	import { gameState } from '$lib/neffos/connection';
	import { onMount } from 'svelte';

	let error: string | null = null;

	async function findGame() {}

	async function getMyGames() {}

	async function waitForEvent(eventName: string): Promise<any> {}

	async function debugWs() {
		const ns = client?.namespace('default');

		if (!ns) {
			console.log('No namespace');
			return;
		}

		const res = await ns.ask(
			'game-start',
			JSON.stringify({
				type: 'bot',
				difficulty: 'easy'
			})
		);

		const body = JSON.parse(res.Body);

		const sessionId = String(body.sessionId);

		console.log(sessionId);

		gameState.update((state) => {
			state.room = sessionId;
			state.phase = 'waiting-start';
			return state;
		});

		const room = await ns.joinRoom(sessionId);

		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject('Timeout');
			}, 10_000);

			gameState.subscribe((state) => {
				if (state.room && state.phase === 'in-progress') {
					clearTimeout(timeout);
					resolve();
				}
			});
		});

		console.log('Game started');
	}

	async function moveWs() {
		const ns = client?.namespace('default');

		if (!ns) {
			console.log('No namespace');
			return;
		}

		const room = await ns.joinRoom($gameState.room!);

		// room.emit(
		// 	'game-move',
		// 	JSON.stringify({
		// 		moves: [
		// 			[1, 2],
		// 			[1, 2]
		// 		]
		// 	})
		// );

		const result = await ns.ask(
			'game-move',
			JSON.stringify({
				room: $gameState.room,
				moves: [
					[1, 2],
					[1, 2]
				]
			})
		);

		console.log('move result', result);
	}

	onMount(() => {
		// @ts-ignore
		window.api = api;
	});
</script>

<Flex>
	<h1>debug</h1>
	<Flex direction="row">
		<button
			on:click={async () => {
				await api.ping();
			}}
		>
			Ping
		</button>
		<button
			on:click={async () => {
				await api.getSession();
			}}
		>
			Get user session
		</button>
		<!-- <button on:click={findGame}>Find game</button> -->
		<button
			on:click={async () => {
				await api.getGames();
			}}
		>
			Get all games
		</button>

		<button on:click={debugWs}>Debug ws</button>
		<button on:click={moveWs}>Move</button>
	</Flex>

	{#if error}
		<Text color="error">{error}</Text>
	{/if}

	{#if client}
		Client is defiend
	{:else}
		Client is not defined
	{/if}

	<Text>
		{#if !$gameState.phase || $gameState.phase === 'none'}
			Not waiting for game to start
		{/if}

		{#if $gameState.phase === 'waiting-start'}
			Waiting for game to start
		{/if}

		{#if $gameState.phase === 'in-progress'}
			Game started
		{/if}

		{#if $gameState.phase === 'finished'}
			Game over
		{/if}
	</Text>
</Flex>
