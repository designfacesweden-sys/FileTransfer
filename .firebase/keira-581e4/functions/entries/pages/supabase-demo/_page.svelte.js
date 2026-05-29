import { H as escape_html, o as ensure_array_like } from "../../../chunks/dev.js";
//#region src/routes/supabase-demo/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		$$renderer.push(`<main class="mx-auto max-w-md p-8 text-stone-100"><h1 class="text-xl font-semibold">Supabase-anslutningstest</h1> <p class="mt-2 text-sm text-stone-400">Använder tabellen <code class="text-stone-300">countries</code> från Supabase snabbstart. Ta bort den här
		routen när du kopplat riktiga tabeller.</p> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mt-4 text-sm text-red-300">${escape_html(data.error)}</p>`);
		} else if (data.countries.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="mt-4 text-sm text-stone-400">Inga rader returnerades. Kör snabbstart-SQL i Supabase först.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<ul class="mt-4 space-y-1 text-sm"><!--[-->`);
			const each_array = ensure_array_like(data.countries);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let country = each_array[$$index];
				$$renderer.push(`<li>${escape_html(country.name)}</li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		}
		$$renderer.push(`<!--]--></main>`);
	});
}
//#endregion
export { _page as default };
