<script lang="ts">
	interface Props {
		video: HTMLVideoElement | null;
	}

	let { video }: Props = $props();

	const DEFAULT_VOLUME = 0.25;

	let playing = $state(true);
	let muted = $state(true);
	let volume = $state(DEFAULT_VOLUME);
	let preferredVolume = $state(DEFAULT_VOLUME);

	function syncFromVideo() {
		if (!video) return;
		playing = !video.paused;
		muted = video.muted;
		volume = video.muted ? preferredVolume : video.volume;
		if (video.muted && video.volume === 1) {
			video.volume = preferredVolume;
		}
	}

	$effect(() => {
		if (!video) return;
		syncFromVideo();

		const onPlay = () => (playing = true);
		const onPause = () => (playing = false);
		const onVolume = () => {
			muted = video!.muted;
			volume = video!.volume;
		};

		video.addEventListener('play', onPlay);
		video.addEventListener('pause', onPause);
		video.addEventListener('volumechange', onVolume);

		return () => {
			video.removeEventListener('play', onPlay);
			video.removeEventListener('pause', onPause);
			video.removeEventListener('volumechange', onVolume);
		};
	});

	function togglePlay() {
		if (!video) return;
		if (video.paused) void video.play();
		else video.pause();
	}

	function toggleMute() {
		if (!video) return;
		if (video.muted) {
			const level = preferredVolume > 0 ? preferredVolume : DEFAULT_VOLUME;
			setVolume(level);
			return;
		}
		if (video.volume > 0) {
			preferredVolume = video.volume;
		}
		video.muted = true;
	}

	function setVolume(value: number) {
		if (!video) return;
		const level = Math.min(1, Math.max(0, value));
		volume = level;
		if (level === 0) {
			video.muted = true;
			return;
		}
		preferredVolume = level;
		video.volume = level;
		video.muted = false;
	}

	function restart() {
		if (!video) return;
		video.currentTime = 0;
		if (video.paused) void video.play();
	}
</script>

<div class="video-ctrl glass" role="group" aria-label="Bakgrundsvideo">
	<button
		type="button"
		class="video-ctrl__btn"
		aria-label={playing ? 'Pausa bakgrundsvideo' : 'Spela bakgrundsvideo'}
		onclick={togglePlay}
	>
		{#if playing}
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M8 5v14l11-7L8 5z" />
			</svg>
		{/if}
	</button>

	<button
		type="button"
		class="video-ctrl__btn"
		aria-label={muted ? 'Slå på ljud' : 'Stäng av ljud'}
		onclick={toggleMute}
	>
		{#if muted}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
				<path
					stroke-linecap="round"
					stroke-width="2"
					d="M11 5 6 9H3v6h3l5 4V5zm7.07 2.93a10 10 0 0 1 0 8.14M15.54 8.46a5 5 0 0 1 0 7.07"
				/>
				<path stroke-linecap="round" stroke-width="2" d="m2 2 20 20" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-width="2" d="M11 5 6 9H3v6h3l5 4V5z" />
				<path
					stroke-linecap="round"
					stroke-width="2"
					d="M15.54 8.46a5 5 0 0 1 0 7.07M17.8 5.2a9 9 0 0 1 0 13.6"
				/>
			</svg>
		{/if}
	</button>

	{#if !muted}
		<label class="video-ctrl__volume">
			<span class="sr-only">Volym</span>
			<input
				type="range"
				class="video-ctrl__slider"
				min="0"
				max="1"
				step="0.05"
				value={volume}
				aria-valuemin={0}
				aria-valuemax={1}
				aria-valuenow={volume}
				aria-valuetext={`${Math.round(volume * 100)}%`}
				oninput={(e) => setVolume(Number((e.currentTarget as HTMLInputElement).value))}
			/>
		</label>
	{/if}

	<button
		type="button"
		class="video-ctrl__btn"
		aria-label="Starta om bakgrundsvideo"
		onclick={restart}
	>
		<svg
			class="video-ctrl__replay"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<!-- Open ring (~300°) + arrowhead at top — no stroke through the center -->
			<path d="M12 3a9 9 0 1 1-7.8 13.5" />
			<path d="M7 6.5 12 3 12 8.5" />
		</svg>
	</button>
</div>

<style>
	.video-ctrl {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		border-radius: 9999px;
		padding: 0.2rem 0.35rem 0.2rem 0.25rem;
	}

	.video-ctrl__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		border-radius: 9999px;
		background: transparent;
		color: rgba(250, 246, 240, 0.8);
		cursor: pointer;
	}

	.video-ctrl__btn svg {
		width: 0.95rem;
		height: 0.95rem;
	}

	.video-ctrl__replay {
		width: 1.05rem;
		height: 1.05rem;
	}

	.video-ctrl__btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-cream);
	}

	.video-ctrl__volume {
		display: flex;
		align-items: center;
		padding: 0 0.25rem;
		animation: volume-in 0.22s ease;
	}

	@keyframes volume-in {
		from {
			opacity: 0;
			max-width: 0;
		}
		to {
			opacity: 1;
			max-width: 5rem;
		}
	}

	.video-ctrl__slider {
		width: 4.5rem;
		height: 0.25rem;
		appearance: none;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 9999px;
		cursor: pointer;
	}

	.video-ctrl__slider::-webkit-slider-thumb {
		appearance: none;
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.35);
	}

	.video-ctrl__slider::-moz-range-thumb {
		width: 0.65rem;
		height: 0.65rem;
		border: none;
		border-radius: 50%;
		background: #ffffff;
	}

	.video-ctrl__slider::-moz-range-track {
		height: 0.25rem;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 9999px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 480px) {
		.video-ctrl__slider {
			width: 3rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.video-ctrl__volume {
			animation: none;
		}
	}
</style>
