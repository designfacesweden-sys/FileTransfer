<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getTransfer, downloadUrl } from '$lib/api';
	import type { TransferPublic } from '@filetransfer/shared';

	let transfer = $state<TransferPublic | null>(null);
	let password = $state('');
	let needsPassword = $state(false);
	let error = $state('');
	let loading = $state(true);
	let remainingSeconds = $state(0);

	const token = $derived($page.params.token ?? '');
	const countdownLabel = $derived(formatCountdown(remainingSeconds));

	async function load() {
		loading = true;
		error = '';
		try {
			transfer = await getTransfer(token, password || undefined);
			needsPassword = false;
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Kunde inte ladda';
			if (message.toLowerCase().includes('password')) {
				needsPassword = true;
			} else {
				error = message;
			}
			transfer = null;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load();
	});

	function updateRemaining() {
		if (!transfer) {
			remainingSeconds = 0;
			return;
		}
		remainingSeconds = Math.max(
			0,
			(new Date(transfer.expiresAt).getTime() - Date.now()) / 1000
		);
	}

	$effect(() => {
		if (!transfer) return;
		updateRemaining();
		const timer = setInterval(updateRemaining, 1000);
		return () => clearInterval(timer);
	});

	function formatBytes(bytes: number) {
		const units = ['B', 'KB', 'MB', 'GB'];
		let value = bytes;
		let i = 0;
		while (value >= 1024 && i < units.length - 1) {
			value /= 1024;
			i++;
		}
		return `${value.toFixed(1)} ${units[i]}`;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('sv-SE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	function formatCountdown(seconds: number): string {
		const total = Math.max(0, Math.ceil(seconds));
		const days = Math.floor(total / 86400);
		const hours = Math.floor((total % 86400) / 3600);
		const minutes = Math.floor((total % 3600) / 60);
		const secs = total % 60;

		if (days > 0) {
			return `${days} d ${hours} tim ${minutes} min`;
		}
		if (hours > 0) {
			return `${hours} tim ${minutes} min ${secs} s`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<section class="download">
	{#if loading}
		<p class="download__loading">Laddar överföring…</p>
	{:else if needsPassword && !transfer}
		<div class="download__panel glass">
			<p class="download__kicker">Skyddad</p>
			<h1 class="download__title">Lösenord krävs</h1>
			<form
				class="mt-4 flex gap-2"
				onsubmit={(e) => {
					e.preventDefault();
					load();
				}}
			>
				<input
					type="password"
					bind:value={password}
					placeholder="Ange lösenord"
					class="glass-input flex-1"
				/>
				<button type="submit" class="btn-primary shrink-0 px-5">Lås upp</button>
			</form>
		</div>
	{:else if error}
		<div class="download__panel glass download__error">{error}</div>
	{:else if transfer}
		<div class="download__panel glass download__panel--wide">
			<h1 class="download__title">{transfer.title || 'Filer till dig'}</h1>
			{#if transfer.message}
				<p class="download__sub">{transfer.message}</p>
			{/if}
			<p class="download__meta">
				Går ut {formatDate(transfer.expiresAt)}
				<span class="download__countdown">· {countdownLabel} kvar</span>
			</p>

			<ul class="download__files">
				{#each transfer.files as file}
					<li class="download__file">
						<div>
							<p class="download__file-name">{file.name}</p>
							<p class="download__file-size">{formatBytes(file.size)}</p>
						</div>
						<a href={downloadUrl(file.id, password || undefined)} class="download__dl">
							Ladda ner
						</a>
					</li>
				{/each}
			</ul>

			{#if !transfer.files.length}
				<p class="download__empty">Inga filer uppladdade än. Kom tillbaka om en stund.</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.download {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	.download__loading {
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.7);
	}

	.download__panel {
		width: 100%;
		max-width: 26rem;
		border-radius: 1.25rem;
		padding: 1.5rem;
	}

	.download__panel--wide {
		max-width: 36rem;
	}

	.download__kicker {
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.download__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-cream);
	}

	.download__sub {
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.65);
	}

	.download__meta {
		margin: 0.35rem 0 0;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
	}

	.download__countdown {
		font-variant-numeric: tabular-nums;
		color: rgba(250, 246, 240, 0.65);
	}

	.download__files {
		margin: 1.25rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.download__file {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.download__file-name {
		margin: 0;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-cream);
	}

	.download__file-size {
		margin: 0.15rem 0 0;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.45);
	}

	.download__dl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: #ffffff;
		font-size: 0.8125rem;
		font-weight: 700;
		color: #0c0a09;
		text-decoration: none;
		white-space: nowrap;
	}

	.download__dl:hover {
		background: rgba(255, 255, 255, 0.88);
	}

	.download__empty {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.5);
	}

	.download__error {
		color: #fca5a5;
		font-size: 0.875rem;
	}
</style>
