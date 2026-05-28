<script lang="ts">
	import { PLANS } from '@filetransfer/shared';

	const free = PLANS.free;
	const standardPlan = PLANS.standard;
	const enterprise = PLANS.enterprise;

	const standardFeatures = [
		`Upp till ${Math.round(standardPlan.maxBytes / 1024 ** 3)} GB per överföring`,
		'Lagring i 5 eller 7 dagar',
		'Lösenordsskyddade länkar',
		'Nedladdningsstatistik'
	];

	type BillingPeriod = 'once' | 'monthly' | 'yearly';

	let billingPeriod = $state<BillingPeriod>('monthly');

	const billingOptions: { id: BillingPeriod; label: string }[] = [
		{ id: 'once', label: 'Engångsbetalning' },
		{ id: 'monthly', label: 'Månadsvis' },
		{ id: 'yearly', label: 'Årsvid' }
	];

	function standardPricing(period: BillingPeriod) {
		switch (period) {
			case 'once':
				return { price: '249 kr', suffix: '', note: 'Engångsbetalning' };
			case 'yearly':
				return { price: '79 kr', suffix: '/mån', note: 'Faktureras årsvis' };
			default:
				return { price: '99 kr', suffix: '/mån', note: 'Faktureras månadsvis' };
		}
	}

	function gb(bytes: number) {
		return `${Math.round(bytes / 1024 ** 3)} GB`;
	}

	const plans = $derived.by(() => {
		const standardPrice = standardPricing(billingPeriod);

		return [
		{
			id: 'free',
			name: 'Gratis',
			pricePrefix: 'Filöverföringar kostar',
			price: '0 kr',
			priceSuffix: '',
			periodNote: 'Gratis för alltid',
			features: [
				`Upp till ${gb(free.maxBytes)} per överföring`,
				'Lagring i 1 eller 2 dagar',
				'Dela via länk eller e-post',
				'Återupptagbara uppladdningar'
			],
			cta: 'Kom igång',
			href: '/',
			disabled: false
		},
		{
			id: 'standard',
			name: 'Standard',
			pricePrefix: 'Stora överföringar kostar',
			price: standardPrice.price,
			priceSuffix: standardPrice.suffix,
			periodNote: standardPrice.note,
			features: standardFeatures,
			cta: 'Prenumerera',
			href: null as string | null,
			disabled: true
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			pricePrefix: 'Din organisation får',
			price: 'Anpassat',
			priceSuffix: '',
			periodNote: 'Skräddarsytt för er organisation',
			features: [
				`Upp till ${gb(enterprise.maxBytes)} per överföring`,
				'Lagring i 5 eller 7 dagar',
				'Anpassade nedladdningssidor',
				'Teamkonton och administration',
				'EU-hosting och GDPR-verktyg',
				'Prioriterad support och SLA'
			],
			cta: 'Kontakta sälj',
			href: 'mailto:hello@keira.com',
			disabled: false
		}
		];
	});
</script>

<svelte:head>
	<title>Priser — Keira</title>
</svelte:head>

<section class="pricing-page">
	<a href="/" class="pricing-page__back">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		Tillbaka
	</a>

	<header class="pricing-page__head">
		<h1 class="pricing-page__title">Enkla priser</h1>
		<p class="pricing-page__sub">
			Börja gratis. Välj Standard om ni skickar stora filer ofta. Enterprise för organisationer
			som behöver branding, efterlevnad och support.
		</p>
	</header>

	<div class="pricing-page__grid">
		{#each plans as plan}
			<article class="pricing-card" class:pricing-card--featured={plan.id === 'standard'}>
				<div class="pricing-card__top">
					<h2 class="pricing-card__name">{plan.name}</h2>
				</div>

				<div class="pricing-card__pricing">
					<p class="pricing-card__price-line">
						{plan.pricePrefix}
						<strong class="pricing-card__price">{plan.price}</strong>
						<span
							class="pricing-card__price-suffix"
							class:pricing-card__price-suffix--hidden={!plan.priceSuffix}
						>
							{plan.priceSuffix || '/mån'}
						</span>
					</p>
					<p class="pricing-card__period">{plan.periodNote}</p>
				</div>

				<ul class="pricing-features">
					{#each plan.features as feature}
						<li class="pricing-feature">
							<svg class="pricing-feature__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="pricing-card__footer">
					{#if plan.href}
						<a href={plan.href} class="pricing-card__cta">{plan.cta}</a>
					{:else}
						<button type="button" class="pricing-card__cta" disabled={plan.disabled}>
							{plan.disabled ? 'Kommer snart' : plan.cta}
						</button>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<div class="pricing-billing" role="group" aria-label="Betalningsintervall">
		{#each billingOptions as option}
			<button
				type="button"
				class="pricing-billing__btn"
				class:pricing-billing__btn--active={billingPeriod === option.id}
				aria-pressed={billingPeriod === option.id}
				onclick={() => (billingPeriod = option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>
</section>

<style>
	.pricing-page {
		position: relative;
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		padding: 0 1.25rem;
		margin: 0 auto;
		max-width: 68rem;
	}

	.pricing-page__back {
		position: absolute;
		top: 0;
		left: 1.25rem;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.65rem 0.4rem 0.45rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: rgba(250, 246, 240, 0.75);
		text-decoration: none;
	}

	.pricing-page__back svg {
		width: 1rem;
		height: 1rem;
	}

	.pricing-page__head {
		text-align: center;
		flex-shrink: 0;
	}

	.pricing-page__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		color: var(--color-cream);
	}

	.pricing-page__sub {
		margin: 0.5rem auto 0;
		max-width: 32rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: rgba(250, 246, 240, 0.55);
	}

	.pricing-page__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1.25rem;
		align-items: stretch;
	}

	.pricing-card {
		display: flex;
		flex-direction: column;
		min-height: 26.5rem;
		height: 100%;
		padding: 1.35rem 1.25rem 1.25rem;
		border-radius: 1.5rem;
		background: #e8e8e8;
		color: #141414;
	}

	.pricing-card--featured {
		background: #ececec;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
	}

	.pricing-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.pricing-card__name {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #0a0a0a;
	}

	.pricing-billing {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		margin-top: 1rem;
		padding: 0.35rem;
		min-height: 2.85rem;
		min-width: min(100%, 28rem);
		border-radius: 9999px;
		background: #e8e8e8;
		align-self: center;
		flex-shrink: 0;
	}

	.pricing-billing__btn {
		flex: 1 1 auto;
		min-width: 7.5rem;
		padding: 0.55rem 1rem;
		border: none;
		border-radius: 9999px;
		background: transparent;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #6b7280;
		cursor: pointer;
		white-space: nowrap;
		text-align: center;
	}

	.pricing-billing__btn--active {
		background: #0a0a0a;
		color: #ffffff;
	}

	.pricing-card__pricing {
		min-height: 4.5rem;
		margin-top: 1rem;
	}

	.pricing-card__price-line {
		margin: 0;
		min-height: 2.75rem;
		font-size: 0.9375rem;
		line-height: 1.45;
		color: #6b7280;
	}

	.pricing-card__price {
		font-weight: 700;
		color: #2563eb;
	}

	.pricing-card__price-suffix {
		color: #6b7280;
		font-weight: 400;
	}

	.pricing-card__price-suffix--hidden {
		visibility: hidden;
	}

	.pricing-card__period {
		margin: 0.35rem 0 0;
		min-height: 1.125rem;
		font-size: 0.75rem;
		line-height: 1.125rem;
		color: #9ca3af;
	}

	.pricing-features {
		flex: 1;
		min-height: 9.75rem;
		margin: 1.1rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.pricing-feature {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.875rem;
		line-height: 1.35;
		color: #1a1a1a;
	}

	.pricing-feature__check {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
		color: #2563eb;
	}

	.pricing-card__footer {
		margin-top: auto;
		padding-top: 1.25rem;
	}

	.pricing-card__cta {
		display: block;
		width: 100%;
		padding: 0.8rem 1rem;
		border: none;
		border-radius: 9999px;
		background: #0a0a0a;
		font-size: 0.875rem;
		font-weight: 700;
		text-align: center;
		text-decoration: none;
		color: #ffffff;
		cursor: pointer;
	}

	.pricing-card__cta:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	@media (max-width: 900px) {
		.pricing-page {
			justify-content: flex-start;
			overflow-y: auto;
			padding-top: 0.5rem;
			padding-bottom: 1rem;
		}

		.pricing-page__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
