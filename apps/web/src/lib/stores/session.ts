import { writable } from 'svelte/store';
import type { Session } from '@auth/sveltekit';
import type { PlanId } from '@filetransfer/shared';

export type ClientUser = {
	id: string;
	email: string;
	name: string | null;
	plan: PlanId;
};

const STORAGE_KEY = 'keira_user';

function readStoredUser(): ClientUser | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as ClientUser) : null;
	} catch {
		return null;
	}
}

export const clientUser = writable<ClientUser | null>(readStoredUser());

export function setClientUser(user: ClientUser | null) {
	clientUser.set(user);
	if (typeof localStorage === 'undefined') return;
	if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	else localStorage.removeItem(STORAGE_KEY);
}

export function clientUserToSession(user: ClientUser | null): Session | null {
	if (!user) return null;
	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name ?? user.email,
			plan: user.plan
		},
		expires: ''
	};
}
