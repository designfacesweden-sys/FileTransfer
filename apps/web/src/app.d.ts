import type { Session } from '@auth/sveltekit';
import type { PlanId } from '@filetransfer/shared';

declare module '@auth/sveltekit' {
	interface Session {
		user: {
			id: string;
			plan: PlanId;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		plan?: PlanId;
		name?: string | null;
		email?: string;
	}
}

declare global {
	namespace App {
		interface Locals {
			auth(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
	}
}

declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		webkitdirectory?: boolean;
	}
}

export {};
