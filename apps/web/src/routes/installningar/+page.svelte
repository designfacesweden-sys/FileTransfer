<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PLAN_LABELS, PLANS, type AuthUser, type PlanId } from '@filetransfer/shared';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: import('./$types').ActionData } = $props();

	let savingProfile = $state(false);

	const user = $derived(form?.user ?? data.user);
	let name = $state('');
	const planId = $derived(user.plan as PlanId);
	const planConfig = $derived(PLANS[planId]);
	const planLabel = $derived(PLAN_LABELS[planId]);

	$effect(() => {
		if (!savingProfile) {
			name = user.name ?? '';
		}
	});

	function userInitial() {
		const source = user.name ?? user.email ?? '?';
		return source.charAt(0).toUpperCase();
	}

	function gb(bytes: number) {
		return `${Math.round(bytes / 1024 ** 3)} GB`;
	}

	const planFeatures = $derived.by(() => {
		const features = [
			`Upp till ${gb(planConfig.maxBytes)} per överföring`,
			planId === 'free' ? 'Lagring i 1 eller 2 dagar' : 'Lagring i 5 eller 7 dagar'
		];
		if (planConfig.passwordProtection) features.push('Lösenordsskyddade länkar');
		if (planConfig.analytics) features.push('Nedladdningsstatistik');
		if (planConfig.customBranding) features.push('Anpassad branding');
		return features;
	});
</script>

<svelte:head>
	<title>Inställningar — Keira</title>
</svelte:head>

<section class="settings-page">
	<div class="settings-page__panel glass">
		<header class="settings-page__header">
			<p class="settings-page__kicker">Konto</p>
			<h1 class="settings-page__title">Inställningar</h1>
		</header>

		<section class="settings-section" aria-labelledby="profile-heading">
			<h2 id="profile-heading" class="settings-section__title">Profil</h2>

			<div class="settings-profile">
				<div class="settings-profile__avatar" aria-hidden="true">
					<span>{userInitial()}</span>
				</div>

				<form
					class="settings-profile__form"
					method="POST"
					action="?/updateProfile"
					use:enhance={() => {
						savingProfile = true;
						return async ({ update: refreshForm, result }) => {
							await refreshForm();
							savingProfile = false;
							if (result.type === 'success' && result.data && 'user' in result.data) {
								const saved = result.data.user as AuthUser;
								name = saved.name ?? '';
								await invalidateAll();
							}
						};
					}}
				>
					<label class="glass-label">
						Namn
						<input
							bind:value={name}
							type="text"
							name="name"
							required
							maxlength="120"
							autocomplete="name"
							class="glass-input mt-1.5"
						/>
					</label>

					<label class="glass-label mt-3">
						E-post
						<input
							type="email"
							value={user.email}
							disabled
							class="glass-input mt-1.5 settings-profile__email"
						/>
					</label>

					{#if form?.profileError}
						<p class="settings-section__error">{form.profileError}</p>
					{:else if form?.profileSuccess}
						<p class="settings-section__success">Profilen sparades.</p>
					{/if}

					<button type="submit" class="btn-primary settings-section__btn" disabled={savingProfile}>
						{savingProfile ? 'Sparar…' : 'Spara profil'}
					</button>
				</form>
			</div>
		</section>

		<section class="settings-section" aria-labelledby="subscription-heading">
			<h2 id="subscription-heading" class="settings-section__title">Prenumeration</h2>

			<div class="settings-subscription glass">
				<div class="settings-subscription__head">
					<div>
						<p class="settings-subscription__label">Nuvarande plan</p>
						<p class="settings-subscription__plan">{planLabel}</p>
					</div>
					<span class="settings-subscription__badge">{planLabel}</span>
				</div>

				<ul class="settings-subscription__features">
					{#each planFeatures as feature}
						<li>{feature}</li>
					{/each}
				</ul>

				{#if planId === 'free'}
					<a href="/pricing" class="settings-subscription__upgrade">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
						</svg>
						Uppgradera
					</a>
				{:else}
					<a href="/pricing" class="settings-subscription__link">Hantera prenumeration →</a>
				{/if}
			</div>
		</section>

		<a href="/" class="settings-page__back">← Tillbaka</a>
	</div>
</section>

<style>
	.settings-page {
		display: flex;
		height: 100%;
		align-items: flex-start;
		justify-content: center;
		padding: 1.5rem 1.25rem;
		overflow-y: auto;
	}

	.settings-page__panel {
		width: 100%;
		max-width: 28rem;
		border-radius: 1.25rem;
		padding: 1.75rem;
	}

	.settings-page__header {
		margin-bottom: 1.5rem;
	}

	.settings-page__kicker {
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.settings-page__title {
		margin: 0.35rem 0 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.settings-section + .settings-section {
		margin-top: 1.75rem;
		padding-top: 1.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.settings-section__title {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-cream);
	}

	.settings-profile {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.settings-profile__avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 0.55rem;
		background: linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.55));
		font-size: 1.1rem;
		font-weight: 700;
		color: #1a1208;
	}

	.settings-profile__form {
		display: flex;
		flex-direction: column;
	}

	.settings-profile__email {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.settings-section__error {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		color: #fca5a5;
	}

	.settings-section__success {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		color: var(--color-mint);
	}

	.settings-section__btn {
		width: 100%;
		margin-top: 1rem;
		padding: 0.75rem;
	}

	.settings-subscription {
		border-radius: 0.85rem;
		padding: 1.1rem;
		background: rgba(0, 0, 0, 0.28);
	}

	.settings-subscription__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.settings-subscription__label {
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(250, 246, 240, 0.45);
	}

	.settings-subscription__plan {
		margin: 0.2rem 0 0;
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.settings-subscription__badge {
		flex-shrink: 0;
		padding: 0.2rem 0.55rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.12);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-gold);
	}

	.settings-subscription__features {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-size: 0.8125rem;
		color: rgba(250, 246, 240, 0.72);
		line-height: 1.4;
	}

	.settings-subscription__features li::before {
		content: '✓ ';
		color: var(--color-gold);
	}

	.settings-subscription__upgrade {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		width: 100%;
		margin-top: 1.1rem;
		padding: 0.75rem;
		border-radius: 9999px;
		background: #ffffff;
		font-size: 0.875rem;
		font-weight: 700;
		color: #1a1208;
		text-decoration: none;
	}

	.settings-subscription__upgrade svg {
		width: 0.9rem;
		height: 0.9rem;
	}

	.settings-subscription__link {
		display: inline-block;
		margin-top: 1rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-gold);
		text-decoration: none;
	}

	.settings-subscription__link:hover {
		text-decoration: underline;
	}

	.settings-page__back {
		display: block;
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
		text-decoration: none;
	}

	.settings-page__back:hover {
		color: var(--color-gold);
	}
</style>
