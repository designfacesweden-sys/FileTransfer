import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { data, error } = await supabase.from('countries').select();

	return {
		countries: data ?? [],
		error: error?.message ?? null
	};
};
