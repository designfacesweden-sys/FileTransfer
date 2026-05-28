<script lang="ts">
	let {
		message = '',
		visible = false,
		onclose
	}: {
		message?: string;
		visible?: boolean;
		onclose?: () => void;
	} = $props();

	function dismiss() {
		onclose?.();
	}
</script>

{#if visible && message}
	<div class="toast" role="status" aria-live="polite">
		<p class="toast__message">{message}</p>
		<button
			type="button"
			class="toast__close"
			aria-label="Stäng"
			onclick={(e) => {
				e.stopPropagation();
				dismiss();
			}}
		>
			×
		</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 50%;
		bottom: 1.5rem;
		z-index: 9999;
		pointer-events: auto;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: min(22rem, calc(100vw - 2rem));
		padding: 0.85rem 1rem;
		border-radius: 0.75rem;
		background: rgba(12, 10, 9, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		transform: translateX(-50%);
		animation: toast-in 0.25s ease;
	}

	.toast__message {
		margin: 0;
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--color-cream);
	}

	.toast__close {
		flex-shrink: 0;
		margin: -0.15rem -0.25rem 0 0;
		padding: 0.25rem 0.35rem;
		min-width: 1.75rem;
		min-height: 1.75rem;
		border: none;
		background: none;
		font-size: 1.25rem;
		line-height: 1;
		color: rgba(250, 246, 240, 0.5);
		cursor: pointer;
	}

	.toast__close:hover {
		color: var(--color-cream);
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
