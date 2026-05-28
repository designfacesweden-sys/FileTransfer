import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';
import Google from '@auth/sveltekit/providers/google';
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET } from '$env/static/private';
import { apiBase } from '$lib/server/api';
import type { Provider } from '@auth/sveltekit/providers';
import type { PlanId } from '@filetransfer/shared';

type CredentialsUser = {
	id: string;
	email: string;
	name: string | null;
	plan: PlanId;
};

const providers: Provider[] = [
	Credentials({
		name: 'credentials',
		credentials: {
			email: { label: 'E-post', type: 'email' },
			password: { label: 'Lösenord', type: 'password' }
		},
		async authorize(credentials) {
			const email = credentials?.email;
			const password = credentials?.password;
			if (typeof email !== 'string' || typeof password !== 'string') return null;

			const res = await fetch(`${apiBase}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!res.ok) return null;

			const user = (await res.json()) as CredentialsUser;

			return {
				id: user.id,
				email: user.email,
				name: user.name ?? user.email,
				plan: user.plan
			};
		}
	})
];

if (AUTH_GOOGLE_ID && AUTH_GOOGLE_SECRET) {
	providers.push(
		Google({
			clientId: AUTH_GOOGLE_ID,
			clientSecret: AUTH_GOOGLE_SECRET
		})
	);
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers,
	secret: AUTH_SECRET,
	trustHost: true,
	pages: {
		signIn: '/logga-in'
	},
	session: {
		strategy: 'jwt'
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				const u = user as CredentialsUser;
				token.sub = u.id;
				token.plan = u.plan ?? 'free';
				token.name = u.name ?? u.email;
				token.email = u.email;
			}

			if (trigger === 'update' && session) {
				const patch = session as { name?: string | null; plan?: PlanId };
				if (patch.name !== undefined) token.name = patch.name ?? token.email;
				if (patch.plan !== undefined) token.plan = patch.plan;
			}

			return token;
		},
		async session({ session, token }) {
			if (!session.user || !token.sub) return session;

			session.user.id = token.sub;

			try {
				const res = await fetch(`${apiBase}/api/auth/me/${token.sub}`);
				if (res.ok) {
					const user = (await res.json()) as CredentialsUser;
					session.user.plan = user.plan ?? 'free';
					session.user.name = user.name ?? user.email;
					session.user.email = user.email;
					return session;
				}
			} catch {
				/* fall back to JWT claims */
			}

			session.user.plan = (token.plan as PlanId) ?? 'free';
			if (typeof token.name === 'string') session.user.name = token.name;
			if (typeof token.email === 'string') session.user.email = token.email;
			return session;
		}
	}
});
