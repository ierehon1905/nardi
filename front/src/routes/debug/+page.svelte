<script lang="ts">
	import { api } from '$lib/api';
	import Flex from '$lib/components/Flex.svelte';
	import Text from '$lib/components/Text.svelte';
	import { client } from '$lib/neffos/client';
	import { onMount } from 'svelte';

	let error: string | null = null;

	async function findGame() {}

	async function getMyGames() {}

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

		<button
			on:click={async () => {
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

				const room = await ns.joinRoom(sessionId);
			}}
		>
			Debug ws
		</button>
	</Flex>

	{#if error}
		<Text color="error">{error}</Text>
	{/if}

	{#if client}
		Client is defiend
		<!-- else -->
	{:else}
		Client is not defined
	{/if}
</Flex>
