import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';
import { updateSupabaseSession } from '$lib/supabase/middleware';

const isStaticFirebase = process.env.FIREBASE_STATIC === '1';

export const handle = isStaticFirebase
	? async ({ event, resolve }) => resolve(event)
	: sequence(updateSupabaseSession, authHandle);
