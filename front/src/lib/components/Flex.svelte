<script lang="ts">
	export let direction: 'row' | 'column' = 'column';
	export let align: 'center' | 'flex-start' | 'flex-end' | 'stretch' = 'stretch';
	export let justify: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' =
		'flex-start';
</script>

<div
	class="flex"
	style="flex-direction: {direction}; align-items: {align}; justify-content: {justify}"
>
	<slot />
</div>

<style>
	.flex {
		display: flex;
		gap: 1rem;
	}
</style>
