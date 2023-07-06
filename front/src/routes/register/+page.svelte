<script lang="ts">
	import { goto } from '$app/navigation';
	import Flex from '$lib/components/Flex.svelte';
	import Text from '$lib/components/Text.svelte';

	import { client } from '$lib/supabase';
	import type { AuthError } from '@supabase/supabase-js';

	let error: undefined | AuthError;

	async function register(event: Event) {
		const formData = new FormData(event.target as HTMLFormElement);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const res = await client.auth.signUp({
			email,
			password
		});

		if (res.error) {
			error = res.error;
			return;
		}

		goto('/');
	}
</script>

<div class="page">
	<Flex align="center">
		<h1>Register</h1>
		<main>
			<form on:submit|preventDefault={register}>
				<Flex>
					<input type="text" name="email" placeholder="email" autocomplete="email" required />
					<input
						type="password"
						name="password"
						placeholder="password"
						autocomplete="current-password"
						required
					/>
					<button type="submit">Register</button>

					{#if error}
						<Text color="error">{error.message}</Text>
					{/if}
				</Flex>
			</form>
		</main>

		<p>
			Already have an account? <a href="/login">Login</a>
		</p>
	</Flex>
</div>

<style>
	.page {
		margin: auto;
		width: 300px;
	}

	main {
		width: 100%;
	}
</style>
