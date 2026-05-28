<script lang="ts">
	import { goto } from '$app/navigation';
	import { loginWithCredentials } from '$lib/auth-client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const result = await loginWithCredentials(email, password);
			if (!result.ok) {
				error = result.error;
				return;
			}
			await goto(data.redirectTo || '/');
		} catch {
			error = 'Inloggningen misslyckades. Försök igen.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Logga in — Keira</title>
</svelte:head>

<section class="auth-page">
	<div class="auth-page__panel glass">
		<p class="auth-page__kicker">Konto</p>
		<h1 class="auth-page__title">Logga in</h1>
		<p class="auth-page__sub">Välkommen tillbaka till Keira.</p>

		<form class="auth-page__form" onsubmit={handleSubmit}>
			<label class="glass-label">
				E-post
				<input
					bind:value={email}
					type="email"
					required
					autocomplete="email"
					class="glass-input mt-1.5"
				/>
			</label>

			<label class="glass-label mt-3">
				Lösenord
				<input
					bind:value={password}
					type="password"
					required
					autocomplete="current-password"
					minlength="8"
					class="glass-input mt-1.5"
				/>
			</label>

			{#if error}
				<p class="auth-page__error">{error}</p>
			{/if}

			<button type="submit" disabled={loading} class="btn-primary auth-page__submit">
				{loading ? 'Loggar in…' : 'Logga in'}
			</button>
		</form>

		<p class="auth-page__switch">
			Har du inget konto?
			<a href="/registrera">Registrera dig</a>
		</p>

		<a href="/" class="auth-page__back">← Tillbaka</a>
	</div>
</section>

<style>
	.auth-page {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	.auth-page__panel {
		width: 100%;
		max-width: 26rem;
		border-radius: 1.25rem;
		padding: 1.75rem;
	}

	.auth-page__kicker {
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.auth-page__title {
		margin: 0.35rem 0 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.auth-page__sub {
		margin: 0.35rem 0 0;
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.5);
		line-height: 1.45;
	}

	.auth-page__form {
		margin-top: 1.25rem;
	}

	.auth-page__error {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		color: #fca5a5;
	}

	.auth-page__submit {
		width: 100%;
		margin-top: 1.25rem;
		padding: 0.8rem;
	}

	.auth-page__switch {
		margin: 1.1rem 0 0;
		text-align: center;
		font-size: 0.8125rem;
		color: rgba(250, 246, 240, 0.5);
	}

	.auth-page__switch a {
		color: var(--color-gold);
		text-decoration: none;
		font-weight: 600;
	}

	.auth-page__switch a:hover {
		text-decoration: underline;
	}

	.auth-page__back {
		display: block;
		margin-top: 1rem;
		text-align: center;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
		text-decoration: none;
	}

	.auth-page__back:hover {
		color: var(--color-gold);
	}
</style>
