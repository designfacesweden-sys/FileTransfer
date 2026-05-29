<script lang="ts">
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import TransferDockIcon from '$lib/components/TransferDockIcon.svelte';
	import { createTransfer, notifyTransferByEmail } from '$lib/api';
	import { uploadFile, type UploadProgress } from '$lib/upload';
	import {
		PLANS,
		defaultExpiryPresetForPlan,
		getExpiryOptionsForPlan,
		type ExpiryPresetId,
		type PlanId
	} from '@filetransfer/shared';
	import { PUBLIC_CLIENT_AUTH } from '$env/static/public';
	import { clientUser } from '$lib/stores/session';

	let { data } = $props();

	type Step = 'idle' | 'ready' | 'uploading' | 'done';

	let files = $state<File[]>([]);
	let recipientEmail = $state('');
	let senderEmail = $state('');

	const session = $derived(
		PUBLIC_CLIENT_AUTH === 'true'
			? $clientUser
				? { user: { plan: $clientUser.plan } }
				: null
			: data.session
	);

	const userPlan = $derived((session?.user?.plan ?? 'free') as PlanId);
	const expiryOptions = $derived(getExpiryOptionsForPlan(userPlan));
	const planConfig = $derived(PLANS[userPlan]);

	let expiryPreset = $state<ExpiryPresetId>('1d');
	let step = $state<Step>('idle');
	let progress = $state<UploadProgress | null>(null);
	let shareLink = $state('');
	let emailSentTo = $state('');
	let error = $state('');
	let copied = $state(false);

	let fileInput = $state<HTMLInputElement | null>(null);
	let folderInput = $state<HTMLInputElement | null>(null);
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let dragOver = $state(false);
	let expiryOpen = $state(false);
	let deliveryMode = $state<'email' | 'link'>('link');
	let passwordEnabled = $state(false);
	let transferPassword = $state('');
	let toastMessage = $state('');
	let toastVisible = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const maxBytes = $derived(planConfig.maxBytes);
	const canUsePassword = $derived(planConfig.passwordProtection);

	const expiryLabel = $derived(
		expiryOptions.find((o) => o.id === expiryPreset)?.label ?? '1 dag'
	);

	$effect(() => {
		const options = expiryOptions;
		if (!options.some((o) => o.id === expiryPreset)) {
			expiryPreset = defaultExpiryPresetForPlan(userPlan);
		}
	});

	function toggleExpiry(event: MouseEvent) {
		event.stopPropagation();
		if (step === 'uploading') return;
		expiryOpen = !expiryOpen;
	}

	function closeExpiry() {
		expiryOpen = false;
	}

	function selectExpiry(id: ExpiryPresetId) {
		expiryPreset = id;
		closeExpiry();
	}

	function onWindowClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.transfer-dock__expiry-wrap')) closeExpiry();
	}

	function setDeliveryMode(mode: 'email' | 'link') {
		if (deliveryMode === mode) return;
		deliveryMode = mode;
		error = '';
	}

	function showPaidFeatureNotice(text: string) {
		if (toastTimer) clearTimeout(toastTimer);
		toastMessage = text;
		toastVisible = true;
		toastTimer = setTimeout(() => {
			toastVisible = false;
			toastTimer = null;
		}, 5000);
	}

	function dismissToast() {
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = null;
		toastVisible = false;
	}

	function togglePassword() {
		if (!canUsePassword) {
			showPaidFeatureNotice(
				'Lösenordsskydd ingår i betalda planer (Standard eller Enterprise).'
			);
			return;
		}
		passwordEnabled = !passwordEnabled;
		if (!passwordEnabled) transferPassword = '';
		error = '';
	}

	function openPaymentWall() {
		showPaidFeatureNotice('Betalvägg ingår i Enterprise-planen.');
	}

	function openFiles() {
		fileInput?.click();
	}

	function openFolders() {
		folderInput?.click();
	}

	function onAddPointerDown() {
		longPressTimer = setTimeout(() => {
			longPressTimer = null;
			openFolders();
		}, 500);
	}

	function onAddPointerUp() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
			openFiles();
		}
	}

	function onAddPointerLeave() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	function onFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) addFiles(input.files);
		input.value = '';
	}

	function addFiles(list: FileList | File[]) {
		const next = [...files];
		for (const file of list) {
			if (file.size > maxBytes) {
				error = `${file.name} exceeds the 2 GB limit.`;
				continue;
			}
			next.push(file);
		}
		if (next.length) {
			files = next;
			if (step === 'idle') step = 'ready';
			error = '';
		}
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		if (!files.length && step === 'ready') step = 'idle';
	}

	function reset() {
		files = [];
		recipientEmail = '';
		senderEmail = '';
		expiryPreset = defaultExpiryPresetForPlan(userPlan);
		deliveryMode = 'link';
		passwordEnabled = false;
		transferPassword = '';
		step = 'idle';
		progress = null;
		shareLink = '';
		emailSentTo = '';
		error = '';
		copied = false;
		closeExpiry();
	}

	async function send() {
		if (!files.length) return;

		let to: string | undefined;
		let from: string | undefined;

		if (deliveryMode === 'email') {
			const recipient = recipientEmail.trim();
			if (!recipient) {
				error = 'Ange en e-postadress att skicka till.';
				return;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
				error = 'Ange en giltig e-postadress.';
				return;
			}
			const sender = senderEmail.trim();
			if (sender && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
				error = 'Ange en giltig e-postadress för dig själv.';
				return;
			}
			to = recipient;
			from = sender || undefined;
		}

		if (passwordEnabled) {
			if (!canUsePassword) {
				error = 'Lösenordsskydd finns på Standard- och Enterprise-planerna.';
				return;
			}
			if (transferPassword.length < 4) {
				error = 'Ange ett lösenord med minst 4 tecken.';
				return;
			}
		}

		error = '';
		step = 'uploading';
		progress = null;

		try {
			const expiry = expiryOptions.find((o) => o.id === expiryPreset) ?? expiryOptions[0];

			const transfer = await createTransfer({
				expirySeconds: expiry.seconds,
				plan: userPlan,
				recipientEmail: to,
				senderEmail: from,
				password: passwordEnabled ? transferPassword : undefined
			});

			for (const file of files) {
				await uploadFile(file, transfer, (p) => {
					progress = p;
				});
			}

			if (deliveryMode === 'email') {
				const notify = await notifyTransferByEmail(transfer.token);
				emailSentTo = notify.intendedTo
					? `${notify.intendedTo} (dev: delivered to ${notify.to})`
					: notify.to;
			}

			shareLink = `${window.location.origin}/d/${transfer.token}`;
			files = [];
			step = 'done';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Uppladdningen misslyckades';
			step = 'ready';
		}
	}

	async function copyLink() {
		await navigator.clipboard.writeText(shareLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function canAcceptDrop() {
		return step === 'idle' || step === 'ready';
	}

	function onDragEnter(event: DragEvent) {
		if (!canAcceptDrop()) return;
		event.preventDefault();
		dragOver = true;
	}

	function onDragOver(event: DragEvent) {
		if (!canAcceptDrop()) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
		dragOver = true;
	}

	function onDragLeave(event: DragEvent) {
		const related = event.relatedTarget as Node | null;
		const zone = event.currentTarget as HTMLElement;
		if (related && zone.contains(related)) return;
		dragOver = false;
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		if (!canAcceptDrop()) return;
		const dropped = event.dataTransfer?.files;
		if (dropped?.length) addFiles(dropped);
	}

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
</script>

<input
	bind:this={fileInput}
	type="file"
	multiple
	class="sr-only"
	onchange={onFileInput}
	aria-hidden="true"
/>
<input
	bind:this={folderInput}
	type="file"
	multiple
	class="sr-only"
	webkitdirectory
	onchange={onFileInput}
	aria-hidden="true"
/>

<svelte:window onclick={onWindowClick} />

<div class="home">
	<div
		class="transfer-dock glass"
		class:transfer-dock--drag={dragOver}
		class:transfer-dock--expanded={step !== 'idle'}
		class:transfer-dock--done={step === 'done'}
		role="region"
		aria-label="Filöverföring"
		ondragenter={onDragEnter}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		ondrop={onDrop}
	>
		{#if step === 'done' && shareLink}
			<div class="transfer-dock__done">
				<div class="transfer-dock__done-copy">
					{#if emailSentTo}
						<p class="transfer-dock__done-label">E-post skickad till {emailSentTo}</p>
						<p class="transfer-dock__done-sub">De kan också använda den här länken:</p>
					{:else}
						<p class="transfer-dock__done-label">Din länk är klar</p>
					{/if}
					<input readonly class="transfer-dock__link" value={shareLink} />
				</div>
				<div class="transfer-dock__done-actions">
					<button type="button" class="btn-primary transfer-dock__send" onclick={copyLink}>
						{copied ? 'Kopierad' : 'Kopiera länk'}
					</button>
					<button type="button" class="btn-ghost transfer-dock__ghost" onclick={reset}>
						Ny överföring
					</button>
				</div>
			</div>
		{:else}
			{#if files.length > 0}
				<div class="transfer-dock__files-bar">
					<div class="transfer-dock__files">
						{#each files as file, i}
							<div class="transfer-dock__chip">
								<span class="transfer-dock__chip-name" title={file.name}>{file.name}</span>
								<span class="transfer-dock__chip-size">{formatBytes(file.size)}</span>
								{#if step !== 'uploading'}
									<button
										type="button"
										class="transfer-dock__chip-remove"
										aria-label="Ta bort {file.name}"
										onclick={() => removeFile(i)}
									>
										×
									</button>
								{/if}
							</div>
						{/each}
					</div>

					{#if step === 'ready' || step === 'uploading'}
						<div class="transfer-dock__toolbar">
							<div class="transfer-dock__tools">
								<span class="transfer-dock__tip-wrap">
									<button
										type="button"
										class="transfer-dock__tool"
										class:transfer-dock__tool--active={deliveryMode === 'link'}
										aria-label="Skapa länk"
										aria-pressed={deliveryMode === 'link'}
										disabled={step === 'uploading'}
										onclick={() => setDeliveryMode('link')}
									>
										<TransferDockIcon name="link" />
									</button>
									<span class="transfer-dock__tip" role="tooltip">Skapa länk</span>
								</span>
								<span class="transfer-dock__tip-wrap">
									<button
										type="button"
										class="transfer-dock__tool"
										class:transfer-dock__tool--active={deliveryMode === 'email'}
										aria-label="Skicka via e-post"
										aria-pressed={deliveryMode === 'email'}
										disabled={step === 'uploading'}
										onclick={() => setDeliveryMode('email')}
									>
										<TransferDockIcon name="mail" />
									</button>
									<span class="transfer-dock__tip" role="tooltip">Skicka via e-post</span>
								</span>
								<span class="transfer-dock__tip-wrap">
									<button
										type="button"
										class="transfer-dock__tool transfer-dock__tool--premium"
										class:transfer-dock__tool--active={passwordEnabled}
										aria-label="Lägg till lösenord"
										aria-pressed={passwordEnabled}
										disabled={step === 'uploading'}
										onclick={togglePassword}
									>
										<TransferDockIcon name="lock" />
									</button>
									<span class="transfer-dock__tip" role="tooltip">
										{canUsePassword ? 'Lägg till lösenord' : 'Lägg till lösenord — Standard-plan'}
									</span>
								</span>
								<span class="transfer-dock__tip-wrap">
									<button
										type="button"
										class="transfer-dock__tool transfer-dock__tool--premium"
										aria-label="Lägg till betalvägg"
										disabled={step === 'uploading'}
										onclick={openPaymentWall}
									>
										<TransferDockIcon name="card" />
									</button>
									<span class="transfer-dock__tip" role="tooltip">Lägg till betalvägg</span>
								</span>
							</div>
						</div>
					{/if}
				</div>

				{#if passwordEnabled && step === 'ready' && canUsePassword}
					<div class="transfer-dock__password-row">
						<input
							type="password"
							bind:value={transferPassword}
							placeholder="Lösenord för nedladdning"
							autocomplete="new-password"
							class="transfer-dock__input transfer-dock__password-input"
						/>
					</div>
				{/if}
			{/if}

			<div class="transfer-dock__row">
				{#if step === 'idle'}
					<button
						type="button"
						class="transfer-dock__add"
						aria-label="Lägg till filer"
						onpointerdown={onAddPointerDown}
						onpointerup={onAddPointerUp}
						onpointerleave={onAddPointerLeave}
						onpointercancel={onAddPointerLeave}
					>
						<img src="/cloud-computing.png" alt="" class="transfer-dock__add-icon" width="28" height="28" />
					</button>
				{/if}

				{#if step === 'idle'}
					<button
						type="button"
						class="transfer-dock__prompt"
						onclick={openFiles}
					>
						<span class="transfer-dock__prompt-title">
							{dragOver ? 'Släpp filerna här' : 'Lägg till dina filer'}
						</span>
						<span class="transfer-dock__prompt-sub">eller dra och släpp · upp till 2 GB per fil</span>
					</button>
				{:else}
					<div class="transfer-dock__fields">
						{#if deliveryMode === 'email'}
							<input
								type="email"
								bind:value={recipientEmail}
								placeholder="E-post till"
								autocomplete="email"
								disabled={step === 'uploading'}
								class="transfer-dock__input"
							/>
							<input
								type="email"
								bind:value={senderEmail}
								placeholder="Din e-post (valfritt)"
								autocomplete="email"
								disabled={step === 'uploading'}
								class="transfer-dock__input"
							/>
						{:else}
							<p class="transfer-dock__link-hint">Få en länk att dela efter överföringen</p>
						{/if}
						<div class="transfer-dock__expiry-wrap">
							<button
								type="button"
								class="transfer-dock__input transfer-dock__expiry-trigger"
								aria-label="Lagringstid"
								aria-haspopup="listbox"
								aria-expanded={expiryOpen}
								disabled={step === 'uploading'}
								onclick={toggleExpiry}
							>
								<span>{expiryLabel}</span>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
							{#if expiryOpen}
								<ul class="transfer-dock__expiry-menu" role="listbox" aria-label="Expiry">
									{#each expiryOptions as option}
										<li role="presentation">
											<button
												type="button"
												role="option"
												aria-selected={expiryPreset === option.id}
												class="transfer-dock__expiry-option"
												class:transfer-dock__expiry-option--active={expiryPreset === option.id}
												onclick={() => selectExpiry(option.id)}
											>
												{option.label}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				{/if}

				{#if step === 'ready'}
					<button type="button" class="transfer-dock__send" onclick={send}>
						Överför
					</button>
				{:else if step === 'uploading'}
					<div class="transfer-dock__uploading">
						<span class="transfer-dock__upload-pct">{progress?.percentage ?? 0}%</span>
						<div class="transfer-dock__upload-track">
							<div
								class="transfer-dock__upload-bar"
								style="width: {progress?.percentage ?? 0}%"
							></div>
						</div>
					</div>
				{/if}
			</div>

			{#if step === 'ready' || step === 'uploading'}
				<div class="transfer-dock__footer">
					<button
						type="button"
						class="transfer-dock__link-btn"
						disabled={step === 'uploading'}
						onclick={reset}
					>
						Avbryt
					</button>
				</div>
			{/if}
		{/if}

		{#if error}
			<p class="transfer-dock__error">{error}</p>
		{/if}
	</div>
</div>

<Toast message={toastMessage} visible={toastVisible} onclose={dismissToast} />

<style>
	.home {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		justify-content: flex-end;
		padding: 0 1rem 0.75rem;
		pointer-events: none;
	}

	.transfer-dock {
		pointer-events: auto;
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		border-radius: 1.1rem;
		padding: 0.85rem 1rem;
		transition: border-color 0.25s ease;
	}

	/* No drop shadow below the dock — avoids dark gradient under the bar */
	.transfer-dock.glass {
		box-shadow: inset 0 1px 0 var(--color-glass-highlight);
	}

	.transfer-dock--drag {
		border-color: rgba(255, 255, 255, 0.45);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.transfer-dock--expanded {
		padding: 1rem 1.1rem;
	}

	.transfer-dock--done {
		padding: 1.1rem 1.15rem;
	}

	/* File chips row */
	.transfer-dock__files-bar {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding-bottom: 0.75rem;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.transfer-dock__files {
		display: flex;
		flex: 1;
		min-width: 0;
		gap: 0.5rem;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.transfer-dock__toolbar {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		flex-shrink: 0;
	}

	.transfer-dock__tools {
		display: flex;
		align-items: center;
		gap: 0.1rem;
	}

	.transfer-dock__tip-wrap {
		position: relative;
		display: flex;
	}

	.transfer-dock__tip {
		position: absolute;
		bottom: calc(100% + 0.45rem);
		left: 50%;
		z-index: 30;
		padding: 0.35rem 0.55rem;
		border-radius: 0.4rem;
		background: rgba(14, 12, 10, 0.96);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1.3;
		color: var(--color-cream);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: translateX(-50%) translateY(4px);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.transfer-dock__tip-wrap:hover .transfer-dock__tip,
	.transfer-dock__tip-wrap:focus-within .transfer-dock__tip {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.transfer-dock__tool {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		color: rgba(250, 246, 240, 0.55);
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.transfer-dock__tool:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-cream);
	}

	.transfer-dock__tool--active {
		background: rgba(255, 255, 255, 0.12);
		color: var(--color-cream);
	}

	.transfer-dock__tool--premium {
		color: rgba(250, 246, 240, 0.55);
	}

	.transfer-dock__tool--premium:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-cream);
	}

	.transfer-dock__tool--premium.transfer-dock__tool--active {
		background: rgba(255, 255, 255, 0.12);
		color: var(--color-cream);
	}

	.transfer-dock__tool:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.transfer-dock__password-row {
		padding-bottom: 0.65rem;
		margin-bottom: 0.65rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.transfer-dock__password-input {
		width: 100%;
		max-width: 16rem;
	}

	.transfer-dock__link-hint {
		flex: 1;
		min-width: 0;
		margin: 0;
		padding: 0 0.25rem;
		font-size: 0.875rem;
		color: rgba(250, 246, 240, 0.55);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.transfer-dock__chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
		max-width: 11rem;
		padding: 0.4rem 0.5rem 0.4rem 0.65rem;
		border-radius: 0.55rem;
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 0.75rem;
	}

	.transfer-dock__chip-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--color-cream);
		font-weight: 500;
	}

	.transfer-dock__chip-size {
		flex-shrink: 0;
		color: rgba(250, 246, 240, 0.4);
		font-size: 0.6875rem;
	}

	.transfer-dock__chip-remove {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		border-radius: 0.3rem;
		background: rgba(255, 255, 255, 0.08);
		color: rgba(250, 246, 240, 0.6);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.transfer-dock__chip-remove:hover {
		background: rgba(255, 255, 255, 0.15);
		color: var(--color-cream);
	}

	/* Main horizontal row */
	.transfer-dock__row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.25rem;
	}

	.transfer-dock__add {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.25rem;
		height: 3.25rem;
		border: 1px dashed rgba(255, 255, 255, 0.28);
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.25);
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.transfer-dock__add:hover {
		border-color: rgba(255, 255, 255, 0.95);
		background: rgba(0, 0, 0, 0.35);
	}

	.transfer-dock__add--busy {
		cursor: default;
		border-style: solid;
	}

	.transfer-dock__add-icon {
		filter: brightness(0) invert(0.35);
		transition: filter 0.2s ease;
	}

	.transfer-dock__add:hover .transfer-dock__add-icon {
		filter: brightness(0) invert(1);
	}

	.transfer-dock__spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: var(--color-gold);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	.transfer-dock__prompt {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.15rem;
		border: none;
		background: transparent;
		padding: 0.25rem 0;
		text-align: left;
		cursor: pointer;
	}

	.transfer-dock__prompt-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-cream);
	}

	.transfer-dock__prompt-sub {
		font-size: 0.8125rem;
		color: rgba(250, 246, 240, 0.45);
	}

	.transfer-dock--drag .transfer-dock__prompt-title {
		color: var(--color-gold);
	}

	.transfer-dock__fields {
		flex: 1;
		display: flex;
		min-width: 0;
		gap: 0.5rem;
	}

	.transfer-dock__input {
		flex: 1;
		min-width: 0;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		background: transparent;
		padding: 0.5rem 0.25rem;
		font-size: 0.875rem;
		color: var(--color-cream);
		outline: none;
		transition: border-color 0.2s ease;
	}

	.transfer-dock__input::placeholder {
		color: rgba(250, 246, 240, 0.35);
	}

	.transfer-dock__input:focus {
		border-bottom-color: var(--color-gold);
	}

	.transfer-dock__input:disabled {
		opacity: 0.5;
	}

	.transfer-dock__expiry-wrap {
		position: relative;
		flex: 0 0 6.75rem;
	}

	.transfer-dock__expiry-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.35rem;
		width: 100%;
		cursor: pointer;
		text-align: left;
	}

	.transfer-dock__expiry-trigger svg {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.transfer-dock__expiry-menu {
		position: absolute;
		bottom: calc(100% + 0.35rem);
		left: 0;
		right: 0;
		z-index: 25;
		margin: 0;
		padding: 0.35rem;
		list-style: none;
		border-radius: 0.55rem;
		background: rgba(18, 16, 14, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
	}

	.transfer-dock__expiry-option {
		display: block;
		width: 100%;
		padding: 0.45rem 0.65rem;
		border: none;
		border-radius: 0.35rem;
		background: transparent;
		font-size: 0.8125rem;
		font-family: inherit;
		text-align: left;
		color: var(--color-cream);
		cursor: pointer;
	}

	.transfer-dock__expiry-option--active {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-cream);
	}

	.transfer-dock__send {
		flex-shrink: 0;
		min-width: 6.5rem;
		padding: 0.75rem 1.35rem;
		border: none;
		border-radius: 0.65rem;
		background: #ffffff;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #0c0a09;
		white-space: nowrap;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.transfer-dock__send:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.88);
	}

	.transfer-dock__send:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.transfer-dock__ghost {
		padding: 0.75rem 1rem;
		white-space: nowrap;
	}

	.transfer-dock__uploading {
		flex-shrink: 0;
		width: 6.5rem;
	}

	.transfer-dock__upload-pct {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-gold);
		text-align: right;
		margin-bottom: 0.25rem;
	}

	.transfer-dock__upload-track {
		height: 4px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.12);
		overflow: hidden;
	}

	.transfer-dock__upload-bar {
		height: 100%;
		border-radius: inherit;
		background: #ffffff;
		transition: width 0.2s ease;
	}

	.transfer-dock__footer {
		margin-top: 0.65rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.transfer-dock__link-btn {
		border: none;
		background: none;
		padding: 0;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.4);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.transfer-dock__link-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Done state */
	.transfer-dock__done {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.transfer-dock__done-copy {
		flex: 1;
		min-width: 0;
	}

	.transfer-dock__done-label {
		margin: 0 0 0.35rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.transfer-dock__done-sub {
		margin: 0 0 0.35rem;
		font-size: 0.75rem;
		color: rgba(250, 246, 240, 0.5);
	}

	.transfer-dock__link {
		width: 100%;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		background: transparent;
		padding: 0.35rem 0;
		font-size: 0.875rem;
		color: var(--color-cream);
		outline: none;
	}

	.transfer-dock__done-actions {
		display: flex;
		flex-shrink: 0;
		gap: 0.5rem;
	}

	.transfer-dock__error {
		margin: 0.65rem 0 0;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(252, 165, 165, 0.2);
		font-size: 0.8125rem;
		color: #fca5a5;
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.home {
			padding: 0 0.65rem 0.5rem;
		}

		.transfer-dock__row {
			flex-wrap: wrap;
		}

		.transfer-dock__fields {
			flex: 1 1 100%;
			flex-direction: column;
			order: 2;
		}

		.transfer-dock__send,
		.transfer-dock__uploading {
			flex: 1 1 100%;
			width: 100%;
			order: 3;
		}

		.transfer-dock__expiry-wrap {
			flex: 1 1 auto;
		}

		.transfer-dock__done {
			flex-direction: column;
			align-items: stretch;
		}

		.transfer-dock__done-actions {
			flex-direction: column;
		}

		.transfer-dock__send,
		.transfer-dock__ghost {
			width: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.transfer-dock__spinner {
			animation: none;
		}
	}
</style>
