<script lang="ts">
	import { page } from '$app/stores';
	import { rawI18n, type Key } from './i18n';

	$: lang = $page.data.props.lang;

	export let key: Key;
	export let params: undefined | Record<string, string> = undefined;
</script>

{@html rawI18n(lang, key, params)}
