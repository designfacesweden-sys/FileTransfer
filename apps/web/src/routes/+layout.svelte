<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import TopNavBar from '$lib/components/TopNavBar.svelte';
	import BackgroundAdsense from '$lib/components/BackgroundAdsense.svelte';
	import { PUBLIC_ADSENSE_CLIENT } from '$env/static/public';
	import { PUBLIC_CLIENT_AUTH } from '$env/static/public';
	import { clientUser, clientUserToSession } from '$lib/stores/session';

	let { children, data } = $props();

	const session = $derived(
		PUBLIC_CLIENT_AUTH === 'true' ? clientUserToSession($clientUser) : data.session
	);

	const darkOverlayRoutes = ['/pricing', '/support', '/logga-in', '/registrera', '/installningar'];
</script>

<svelte:head>
	{#if PUBLIC_ADSENSE_CLIENT}
		<script
			async
			src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUBLIC_ADSENSE_CLIENT}"
			crossorigin="anonymous"
		></script>
	{/if}
	<link rel="icon" href={favicon} />
	<title>Keira — Säker filöverföring</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=Outfit:wght@500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="shell">
	<div class="shell__bg">
		<BackgroundAdsense />
		{#if darkOverlayRoutes.includes($page.url.pathname)}
			<div class="shell__overlay"></div>
		{/if}
		<div class="shell__vignette"></div>
		<div class="shell__grain"></div>
	</div>

	<header class="shell__header">
		<a href="/" class="shell__logo">
			<span class="shell__logo-mark">Kei</span><span class="shell__logo-accent">ra</span>
		</a>
		<TopNavBar session={session} />
	</header>

	<main class="shell__main">
		{@render children()}
	</main>

	<footer class="shell__footer">
		<div class="shell__footer-left">
			<span class="shell__footer-brand">Keira</span>
		</div>
		<span class="shell__footer-credit">Skapat och förbehållet av CERCINO</span>
	</footer>
</div>

<style>
	.shell {
		position: relative;
		display: flex;
		height: 100dvh;
		flex-direction: column;
		overflow: hidden;
	}

	.shell__bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.shell__overlay,
	.shell__vignette,
	.shell__grain {
		pointer-events: none;
	}

	.shell__overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.52);
	}

	.shell__vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, rgba(0, 0, 0, 0.55) 100%),
			linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.65) 100%);
	}

	.shell__grain {
		position: absolute;
		inset: 0;
		opacity: 0.04;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	.shell__header {
		position: relative;
		z-index: 10;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.5rem;
		overflow: visible;
	}

	.shell__logo {
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 3vw, 2.4rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		text-decoration: none;
		color: var(--color-cream);
		text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
	}

	.shell__logo-accent {
		color: var(--color-gold);
	}

	.shell__main {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		overflow: hidden;
	}

	.shell__footer {
		position: relative;
		z-index: 10;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.65rem 1.5rem 1rem;
		font-size: 0.625rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(250, 246, 240, 0.45);
	}

	.shell__footer-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.shell__footer-brand {
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: rgba(250, 246, 240, 0.85);
	}

	@media (max-width: 640px) {
		.shell__footer {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.shell__footer-left {
			justify-content: center;
		}

		.shell__header {
			padding: 0.85rem 1rem;
		}
	}
</style>

