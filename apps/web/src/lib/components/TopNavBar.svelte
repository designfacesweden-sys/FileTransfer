<script lang="ts">
	import type { Session } from '@auth/sveltekit';
	import { logout } from '$lib/auth-client';
	import { PLAN_LABELS, type PlanId } from '@filetransfer/shared';
	import LoginWidget from '$lib/components/LoginWidget.svelte';

	interface Props {
		session: Session | null;
	}

	let { session }: Props = $props();

	const planLabel = $derived(
		session?.user?.plan ? PLAN_LABELS[session.user.plan as PlanId] : 'Gratis'
	);

	const MENU_WIDTH = 248;

	let loginOpen = $state(false);
	let loginMode = $state<'login' | 'register'>('login');
	let profileOpen = $state(false);
	let profileTrigger = $state<HTMLButtonElement | null>(null);
	let menuTop = $state(0);
	let menuLeft = $state(0);

	function openLogin() {
		loginMode = 'login';
		loginOpen = true;
	}

	function openRegister() {
		loginMode = 'register';
		loginOpen = true;
	}

	function positionMenu() {
		if (!profileTrigger) return;
		const rect = profileTrigger.getBoundingClientRect();
		menuTop = rect.bottom + 8;
		menuLeft = Math.max(
			12,
			Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 12)
		);
	}

	function toggleProfile(event: MouseEvent) {
		event.stopPropagation();
		profileOpen = !profileOpen;
		if (profileOpen) positionMenu();
	}

	function closeProfile() {
		profileOpen = false;
	}

	function handleLogout() {
		closeProfile();
		logout();
	}

	function userInitial(user: NonNullable<Session['user']>) {
		const source = user.name ?? user.email ?? '?';
		return source.charAt(0).toUpperCase();
	}

	function onWindowClick(event: MouseEvent) {
		if (!(event.target as HTMLElement).closest('[data-account-bar]')) {
			closeProfile();
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeProfile();
	}

	$effect(() => {
		if (!profileOpen) return;
		positionMenu();
		const onLayout = () => positionMenu();
		window.addEventListener('resize', onLayout);
		window.addEventListener('scroll', onLayout, true);
		return () => {
			window.removeEventListener('resize', onLayout);
			window.removeEventListener('scroll', onLayout, true);
		};
	});
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<LoginWidget bind:open={loginOpen} bind:mode={loginMode} onClose={closeProfile} />

<div class="account-bar" data-account-bar aria-label="Konto">
	<a href="/pricing" class="account-bar__upgrade">Uppgradera</a>

	{#if session?.user}
		<div class="account-bar__user">
			<button
				bind:this={profileTrigger}
				type="button"
				class="account-bar__profile"
				class:account-bar__profile--open={profileOpen}
				aria-expanded={profileOpen}
				aria-haspopup="true"
				aria-label="Öppna konto"
				onclick={toggleProfile}
			>
				{#if session.user.image}
					<img
						class="account-bar__profile-img"
						src={session.user.image}
						alt=""
						width="28"
						height="28"
						referrerpolicy="no-referrer"
					/>
				{:else}
					<span class="account-bar__profile-initial">{userInitial(session.user)}</span>
				{/if}
			</button>

			{#if profileOpen}
				<aside
					class="account-menu"
					role="menu"
					style:top="{menuTop}px"
					style:left="{menuLeft}px"
					style:width="{MENU_WIDTH}px"
				>
					<div class="account-menu__top">
						<p class="account-menu__email" title={session.user.email ?? undefined}>
							{session.user.email ?? session.user.name}
						</p>
						<p class="account-menu__plan">{planLabel}</p>
					</div>

					<div class="account-menu__links">
						<a href="/installningar" role="menuitem" class="account-menu__link" onclick={closeProfile}>
							Inställningar
						</a>
						<a href="/pricing" role="menuitem" class="account-menu__link" onclick={closeProfile}>
							Prenumeration
						</a>
						<button type="button" role="menuitem" class="account-menu__link account-menu__link--out" onclick={handleLogout}>
							Logga ut
						</button>
					</div>
				</aside>
			{/if}
		</div>
	{:else}
		<div class="account-bar__guest">
			<button type="button" class="account-bar__guest-btn" onclick={openLogin}>Logga in</button>
			<button type="button" class="account-bar__guest-btn account-bar__guest-btn--fill" onclick={openRegister}>
				Skapa konto
			</button>
		</div>
	{/if}

	<a href="/support" class="account-bar__help" aria-label="Hjälp och support">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
			<circle cx="12" cy="12" r="9.25" />
			<path stroke-linecap="round" d="M9.75 9.5a2.25 2.25 0 1 1 3.6 1.85c-.7.47-1.1 1-1.1 1.9v.15" />
			<circle cx="12" cy="16.75" r="0.85" fill="currentColor" stroke="none" />
		</svg>
	</a>
</div>

<style>
	.account-bar {
		--account-control-h: 2.35rem;
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}

	/* Upgrade — compact outline chip */
	.account-bar__upgrade {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		height: var(--account-control-h);
		padding: 0 0.85rem;
		border-radius: 0.55rem;
		border: 1px solid rgba(255, 255, 255, 0.45);
		background: rgba(255, 255, 255, 0.08);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #ffffff;
		text-decoration: none;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.account-bar__upgrade:hover {
		background: rgba(255, 255, 255, 0.14);
		border-color: rgba(255, 255, 255, 0.65);
		color: #ffffff;
	}

	/* Profile — matches help tile + upgrade border */
	.account-bar__user {
		position: relative;
	}

	.account-bar__profile {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: var(--account-control-h);
		height: var(--account-control-h);
		padding: 0;
		border-radius: 0.55rem;
		border: 1px solid rgba(255, 255, 255, 0.45);
		background: rgba(255, 255, 255, 0.08);
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.account-bar__profile--open,
	.account-bar__profile:hover {
		border-color: rgba(255, 255, 255, 0.65);
		background: rgba(255, 255, 255, 0.14);
	}

	.account-bar__profile-img {
		width: 1.65rem;
		height: 1.65rem;
		border-radius: 0.35rem;
		object-fit: cover;
	}

	.account-bar__profile-initial {
		font-size: 0.8rem;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
	}

	/* Guest auth */
	.account-bar__guest {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.account-bar__guest-btn {
		padding: 0.45rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: transparent;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(250, 246, 240, 0.75);
		cursor: pointer;
	}

	.account-bar__guest-btn--fill {
		border-color: transparent;
		background: var(--color-cream);
		color: #141210;
	}

	/* Help — square icon tile */
	.account-bar__help {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: var(--account-control-h);
		height: var(--account-control-h);
		border-radius: 0.55rem;
		border: 1px solid rgba(255, 255, 255, 0.45);
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.75);
		text-decoration: none;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.account-bar__help:hover {
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.65);
		background: rgba(255, 255, 255, 0.14);
	}

	.account-bar__help svg {
		width: 1.15rem;
		height: 1.15rem;
	}

	/* Profile menu — aligned under trigger, same border language */
	.account-menu {
		position: fixed;
		z-index: 300;
		padding: 0.5rem;
		border-radius: 0.55rem;
		background: rgba(12, 10, 9, 0.94);
		border: 1px solid rgba(255, 255, 255, 0.45);
		box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
	}

	.account-menu__top {
		padding: 0.5rem 0.55rem 0.6rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.account-menu__email {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #ffffff;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.account-menu__plan {
		margin: 0.25rem 0 0;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.45);
	}

	.account-menu__links {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding-top: 0.35rem;
	}

	.account-menu__link {
		display: block;
		width: 100%;
		padding: 0.5rem 0.55rem;
		border: none;
		border-radius: 0.4rem;
		background: transparent;
		font-size: 0.8125rem;
		font-weight: 500;
		text-align: left;
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		cursor: pointer;
	}

	.account-menu__link:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.account-menu__link--out {
		margin-top: 0.2rem;
		padding-top: 0.55rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0;
		color: rgba(255, 255, 255, 0.45);
	}

	.account-menu__link--out:hover {
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
	}

	@media (max-width: 640px) {
		.account-bar {
			gap: 0.45rem;
		}

		.account-bar__upgrade {
			padding: 0 0.6rem;
			font-size: 0.625rem;
		}

		.account-bar__guest-btn:not(.account-bar__guest-btn--fill) {
			display: none;
		}
	}
</style>
