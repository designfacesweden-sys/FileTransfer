<script lang="ts">
	interface Props {
		video: HTMLVideoElement | null;
	}

	let { video }: Props = $props();

	let remainingSeconds = $state(0);
	let hasValidDuration = $state(false);

	function formatCountdown(seconds: number): string {
		const total = Math.max(0, Math.ceil(seconds));
		const minutes = Math.floor(total / 60);
		const secs = total % 60;
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}

	const countdownLabel = $derived(formatCountdown(remainingSeconds));

	function updateRemaining() {
		if (!video) {
			remainingSeconds = 0;
			hasValidDuration = false;
			return;
		}
		const duration = video.duration;
		if (!Number.isFinite(duration) || duration <= 0) {
			remainingSeconds = 0;
			hasValidDuration = false;
			return;
		}
		hasValidDuration = true;
		remainingSeconds = Math.max(0, duration - video.currentTime);
	}

	$effect(() => {
		if (!video) return;

		updateRemaining();

		const onTimeUpdate = () => updateRemaining();
		const onDurationChange = () => updateRemaining();

		video.addEventListener('timeupdate', onTimeUpdate);
		video.addEventListener('loadedmetadata', onDurationChange);
		video.addEventListener('durationchange', onDurationChange);
		video.addEventListener('seeked', onDurationChange);
		video.addEventListener('ended', onDurationChange);

		return () => {
			video.removeEventListener('timeupdate', onTimeUpdate);
			video.removeEventListener('loadedmetadata', onDurationChange);
			video.removeEventListener('durationchange', onDurationChange);
			video.removeEventListener('seeked', onDurationChange);
			video.removeEventListener('ended', onDurationChange);
		};
	});
</script>

{#if hasValidDuration}
	<span
		class="video-countdown"
		aria-live="off"
		aria-label="Nästa video om {countdownLabel}"
		title="Nästa video"
	>
		{countdownLabel}
	</span>
{/if}

<style>
	.video-countdown {
		font-family: var(--font-sans);
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		font-variant-numeric: tabular-nums;
		color: rgba(250, 246, 240, 0.5);
	}
</style>
