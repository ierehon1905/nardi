<script lang="ts">
	import { api } from '$lib/api';
	import Flex from '$lib/components/Flex.svelte';
	import Text from '$lib/components/Text.svelte';

	let error: string | null = null;

	async function getUserId() {
		await api.getSession();
	}

	async function findGame() {}

	async function getMyGames() {}
</script>

<Flex>
	<h1>debug</h1>
	<Flex direction="row">
		<button on:click={getUserId}>Get user session</button>
		<button on:click={findGame}>Find game</button>
		<button on:click={getMyGames}>Get my sessions</button>
	</Flex>

	{#if error}
		<Text color="error">{error}</Text>
	{/if}
</Flex>
