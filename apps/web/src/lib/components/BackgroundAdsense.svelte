<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_ADSENSE_CLIENT, PUBLIC_ADSENSE_SLOT } from '$env/static/public';

	let adPushed = $state(false);
	let adFailed = $state(false);

	function pushAd() {
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			adPushed = true;
		} catch {
			adFailed = true;
		}
	}

	onMount(() => {
		if (!PUBLIC_ADSENSE_SLOT) return;

		void (async () => {
			await tick();
			if (typeof window.adsbygoogle !== 'undefined') {
				pushAd();
				return;
			}
			const deadline = Date.now() + 12_000;
			const timer = window.setInterval(() => {
				if (typeof window.adsbygoogle !== 'undefined') {
					window.clearInterval(timer);
					pushAd();
				} else if (Date.now() > deadline) {
					window.clearInterval(timer);
					adFailed = true;
				}
			}, 150);
		})();
	});
</script>

{#if browser && PUBLIC_ADSENSE_CLIENT && PUBLIC_ADSENSE_SLOT}
	<div class="bg-ad">
		<p class="bg-ad__label">Annons</p>
		<ins
			class="adsbygoogle bg-ad__unit"
			data-ad-client={PUBLIC_ADSENSE_CLIENT}
			data-ad-slot={PUBLIC_ADSENSE_SLOT}
			data-ad-format="auto"
			data-full-width-responsive="true"
		></ins>
		{#if adFailed && !adPushed}
			<p class="bg-ad__hint">
				Annonser visas när keira.se är godkänd i AdSense och ads.txt är verifierad.
			</p>
		{/if}
	</div>
{:else}
	<div class="bg-ad bg-ad--fallback" aria-hidden="true"></div>
{/if}

<style>
	.bg-ad {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: #0a0a0a;
	}

	.bg-ad--fallback {
		background:
			radial-gradient(ellipse 70% 60% at 50% 40%, rgba(40, 36, 32, 0.9), #0a0a0a 70%),
			#0a0a0a;
	}

	.bg-ad__label {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 1;
		margin: 0;
		padding: 0.2rem 0.45rem;
		font-size: 0.625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(250, 246, 240, 0.35);
		pointer-events: none;
	}

	.bg-ad__unit {
		display: block;
		width: 100%;
		min-height: 100dvh;
	}

	.bg-ad__hint {
		position: absolute;
		bottom: 5rem;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		max-width: 22rem;
		padding: 0 1rem;
		text-align: center;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
		pointer-events: none;
	}
</style>
