<script lang="ts">
	import { submitSupport } from '$lib/api';
	import { translateApiError } from '$lib/i18n/api-errors';
	import type { SupportCategory } from '@filetransfer/shared';

	let name = $state('');
	let email = $state('');
	let category = $state<SupportCategory>('general');
	let subject = $state('');
	let message = $state('');
	let sending = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';
		success = '';
		sending = true;

		try {
			const res = await submitSupport({
				name: name.trim(),
				email: email.trim(),
				category,
				subject: subject.trim(),
				message: message.trim()
			});
			success = translateApiError(res.message);
			name = '';
			email = '';
			category = 'general';
			subject = '';
			message = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Något gick fel. Försök igen.';
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>Support — FjordSend</title>
</svelte:head>

<section class="support">
	<div class="support__panel glass">
		<p class="support__kicker">Hjälp</p>
		<h1 class="support__title">Support</h1>
		<p class="support__sub">
			Skicka ett meddelande till oss — vi svarar via e-post. Förfrågningar sparas hos CERCINO.
		</p>

		{#if success}
			<div class="support__success">{success}</div>
		{:else}
			<form class="support__form" onsubmit={handleSubmit}>
				<label class="glass-label">
					Namn
					<input bind:value={name} required maxlength="120" class="glass-input mt-1.5" />
				</label>

				<label class="glass-label mt-3">
					E-post
					<input
						bind:value={email}
						type="email"
						required
						class="glass-input mt-1.5"
					/>
				</label>

				<label class="glass-label mt-3">
					Kategori
					<select bind:value={category} class="glass-input mt-1.5">
						<option value="general">Allmänt</option>
						<option value="billing">Fakturering</option>
						<option value="technical">Tekniskt</option>
						<option value="enterprise">Enterprise</option>
					</select>
				</label>

				<label class="glass-label mt-3">
					Ämne
					<input bind:value={subject} required maxlength="200" class="glass-input mt-1.5" />
				</label>

				<label class="glass-label mt-3">
					Meddelande
					<textarea
						bind:value={message}
						required
						minlength="10"
						maxlength="5000"
						rows="5"
						class="glass-input mt-1.5 resize-y"
						placeholder="Beskriv ditt ärende…"
					></textarea>
				</label>

				{#if error}
					<p class="support__error">{error}</p>
				{/if}

				<button type="submit" disabled={sending} class="btn-primary support__submit">
					{sending ? 'Skickar…' : 'Skicka förfrågan'}
				</button>
			</form>
		{/if}

		<a href="/" class="support__back">← Tillbaka till startsidan</a>
	</div>
</section>

<style>
	.support {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	.support__panel {
		width: 100%;
		max-width: 28rem;
		border-radius: 1.25rem;
		padding: 1.75rem;
	}

	.support__kicker {
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.support__title {
		margin: 0.35rem 0 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.support__sub {
		margin: 0.35rem 0 0;
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.5);
		line-height: 1.45;
	}

	.support__form {
		margin-top: 1.25rem;
	}

	.support__success {
		margin-top: 1.25rem;
		padding: 0.85rem 1rem;
		border-radius: 0.65rem;
		background: rgba(110, 231, 183, 0.12);
		border: 1px solid rgba(110, 231, 183, 0.35);
		font-size: 0.875rem;
		color: var(--color-mint);
	}

	.support__error {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		color: #fca5a5;
	}

	.support__submit {
		width: 100%;
		margin-top: 1.25rem;
		padding: 0.8rem;
	}

	.support__back {
		display: block;
		margin-top: 1.25rem;
		text-align: center;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
		text-decoration: none;
	}

	.support__back:hover {
		color: var(--color-gold);
	}
</style>
