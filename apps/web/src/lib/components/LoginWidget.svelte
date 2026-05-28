<script lang="ts">
	import { loginWithCredentials } from '$lib/auth-client';
	import { registerUser } from '$lib/api';

	interface Props {
		open?: boolean;
		mode?: 'login' | 'register';
		onClose?: () => void;
		onSuccess?: () => void;
	}

	let { open = $bindable(false), mode = $bindable<'login' | 'register'>('login'), onClose, onSuccess }: Props =
		$props();

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');

	function close() {
		open = false;
		error = '';
		onClose?.();
	}

	function switchMode(next: 'login' | 'register') {
		mode = next;
		error = '';
	}

	async function handleLogin(event: Event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const result = await loginWithCredentials(email, password);
			if (!result.ok) {
				error = result.error;
				return;
			}
			email = '';
			password = '';
			close();
			onSuccess?.();
		} catch {
			error = 'Inloggningen misslyckades. Försök igen.';
		} finally {
			loading = false;
		}
	}

	async function handleRegister(event: Event) {
		event.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Lösenorden matchar inte';
			return;
		}

		loading = true;

		try {
			await registerUser({
				email: email.trim(),
				password,
				name: name.trim() || undefined
			});

			const result = await loginWithCredentials(email, password);
			if (!result.ok) {
				error = result.error;
				return;
			}

			name = '';
			email = '';
			password = '';
			confirmPassword = '';
			close();
			onSuccess?.();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Registreringen misslyckades';
		} finally {
			loading = false;
		}
	}

	function onBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) close();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="login-widget__backdrop" onclick={onBackdropClick} role="presentation">
		<div class="login-widget glass" role="dialog" aria-modal="true" aria-labelledby="login-widget-title">
			<button type="button" class="login-widget__close" aria-label="Stäng" onclick={close}>×</button>

			<p class="login-widget__kicker">Konto</p>
			<h2 id="login-widget-title" class="login-widget__title">
				{mode === 'login' ? 'Logga in' : 'Registrera dig'}
			</h2>

			<div class="login-widget__tabs" role="tablist">
				<button
					type="button"
					role="tab"
					class="login-widget__tab"
					class:login-widget__tab--active={mode === 'login'}
					aria-selected={mode === 'login'}
					onclick={() => switchMode('login')}
				>
					Logga in
				</button>
				<button
					type="button"
					role="tab"
					class="login-widget__tab"
					class:login-widget__tab--active={mode === 'register'}
					aria-selected={mode === 'register'}
					onclick={() => switchMode('register')}
				>
					Registrera
				</button>
			</div>

			{#if mode === 'login'}
				<form class="login-widget__form" onsubmit={handleLogin}>
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
						<p class="login-widget__error">{error}</p>
					{/if}
					<button type="submit" disabled={loading} class="btn-primary login-widget__submit">
						{loading ? 'Loggar in…' : 'Logga in'}
					</button>
				</form>
			{:else}
				<form class="login-widget__form" onsubmit={handleRegister}>
					<label class="glass-label">
						Namn <span class="login-widget__optional">(valfritt)</span>
						<input bind:value={name} maxlength="120" autocomplete="name" class="glass-input mt-1.5" />
					</label>
					<label class="glass-label mt-3">
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
							minlength="8"
							autocomplete="new-password"
							class="glass-input mt-1.5"
						/>
					</label>
					<label class="glass-label mt-3">
						Bekräfta lösenord
						<input
							bind:value={confirmPassword}
							type="password"
							required
							minlength="8"
							autocomplete="new-password"
							class="glass-input mt-1.5"
						/>
					</label>
					{#if error}
						<p class="login-widget__error">{error}</p>
					{/if}
					<button type="submit" disabled={loading} class="btn-primary login-widget__submit">
						{loading ? 'Skapar konto…' : 'Skapa konto'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.login-widget__backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(4px);
	}

	.login-widget {
		position: relative;
		width: 100%;
		max-width: 24rem;
		border-radius: 1.15rem;
		padding: 1.5rem 1.35rem 1.35rem;
	}

	.login-widget__close {
		position: absolute;
		top: 0.65rem;
		right: 0.65rem;
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		border-radius: 0.4rem;
		background: rgba(255, 255, 255, 0.08);
		font-size: 1.25rem;
		line-height: 1;
		color: rgba(250, 246, 240, 0.6);
		cursor: pointer;
	}

	.login-widget__kicker {
		margin: 0;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.login-widget__title {
		margin: 0.3rem 0 0;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.login-widget__tabs {
		display: flex;
		gap: 0.35rem;
		margin-top: 1rem;
		padding: 0.2rem;
		border-radius: 0.55rem;
		background: rgba(0, 0, 0, 0.3);
	}

	.login-widget__tab {
		flex: 1;
		padding: 0.45rem 0.5rem;
		border: none;
		border-radius: 0.4rem;
		background: transparent;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(250, 246, 240, 0.5);
		cursor: pointer;
	}

	.login-widget__tab--active {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-cream);
	}

	.login-widget__form {
		margin-top: 1rem;
	}

	.login-widget__optional {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: rgba(250, 246, 240, 0.35);
	}

	.login-widget__error {
		margin: 0.65rem 0 0;
		font-size: 0.8125rem;
		color: #fca5a5;
	}

	.login-widget__submit {
		width: 100%;
		margin-top: 1rem;
		padding: 0.75rem;
	}
</style>
