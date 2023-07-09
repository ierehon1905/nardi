<script>
	import { onMount } from 'svelte';
	import './styles.scss';

	onMount(async () => {
		const mod = await import('$lib/neffos/connection');

		mod.initConnection();
	});
</script>

<svelte:head>
	<title>Nardy</title>
	<meta
		name="description"
		content="Nardy game, play backgammon online with friends or random people and bots. Play on mobile or desktop"
	/>
	<meta
		name="keywords"
		content="nardy, backgammon, online, game, play, longgammon, nardi, gammon"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<meta property="og:title" content="Nardy" />
	<meta property="og:description" content="Nardy game" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://nardy.am/ogimage.jpg" />
	<meta property="og:url" content="https://nardy.am" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:domain" content="nardy.am" />
	<meta name="twitter:url" content="https://nardy.am" />
	<meta name="twitter:site" content="@ierehon1905" />
	<meta name="twitter:title" content="Nardy" />
	<meta name="twitter:description" content="Nardy game" />
	<meta name="twitter:image" content="https://nardy.am/ogimage.jpg" />

	<link rel="apple-touch-icon" href="/favicon.png" sizes="128x128" />
	<link rel="icon" type="image/png" href="/favicon.png" sizes="128x128" />
</svelte:head>

<slot />
