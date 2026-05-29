<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_ADSENSE_CLIENT, PUBLIC_ADSENSE_SLOT } from '$env/static/public';

	let adReady = $state(false);

	onMount(() => {
		if (!PUBLIC_ADSENSE_SLOT) return;
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			adReady = true;
		} catch {
			/* ad blocker or script not loaded */
		}
	});
</script>

{#if browser && PUBLIC_ADSENSE_CLIENT && PUBLIC_ADSENSE_SLOT}
	<div class="bg-ad" class:bg-ad--ready={adReady}>
		<ins
			class="adsbygoogle bg-ad__unit"
			data-ad-client={PUBLIC_ADSENSE_CLIENT}
			data-ad-slot={PUBLIC_ADSENSE_SLOT}
			data-ad-format="auto"
			data-full-width-responsive="true"
		></ins>
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

	.bg-ad__unit {
		display: block;
		width: 100%;
		min-height: 100%;
	}
</style>
