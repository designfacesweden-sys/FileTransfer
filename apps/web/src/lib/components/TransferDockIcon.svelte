<script lang="ts">
	type IconName = 'link' | 'mail' | 'lock' | 'card';

	let { name }: { name: IconName } = $props();
</script>

<svg
	class="transfer-dock-icon"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'link'}
		<path d="M9 17H7A5 5 0 0 1 7 7h2" />
		<path d="M15 7h2a5 5 0 0 1 0 10h-2" />
		<line x1="8" x2="16" y1="12" y2="12" />
	{:else if name === 'mail'}
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	{:else if name === 'lock'}
		<rect width="18" height="11" x="3" y="11" rx="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	{:else if name === 'card'}
		<rect width="20" height="14" x="2" y="5" rx="2" />
		<line x1="2" x2="22" y1="10" y2="10" />
	{/if}
</svg>

<style>
	.transfer-dock-icon {
		display: block;
		width: 1.125rem;
		height: 1.125rem;
	}
</style>
