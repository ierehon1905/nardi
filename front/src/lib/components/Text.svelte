<script lang="ts">
	export let color: undefined | 'error' | 'warning' | 'success' | 'info' = undefined;

	const colorMap = {
		error: 'var(--color-text-error)',
		warning: 'var(--color-text-warning)',
		success: 'var(--color-text-success)',
		info: 'var(--color-text-info)'
	};

	const style = color ? `color: ${colorMap[color]}` : '';
</script>

<span {style}>
	<slot />
</span>
