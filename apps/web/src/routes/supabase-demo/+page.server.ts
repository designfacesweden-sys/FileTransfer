import { isFirebaseStaticBuild } from '$lib/firebase-static';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (isFirebaseStaticBuild) {
		return { countries: [], error: null };
	}
	const { data, error } = await supabase.from('countries').select();

	return {
		countries: data ?? [],
		error: error?.message ?? null
	};
};
