<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto max-w-md p-8 text-stone-100">
	<h1 class="text-xl font-semibold">Supabase-anslutningstest</h1>
	<p class="mt-2 text-sm text-stone-400">
		Använder tabellen <code class="text-stone-300">countries</code> från Supabase snabbstart. Ta bort den här
		routen när du kopplat riktiga tabeller.
	</p>

	{#if data.error}
		<p class="mt-4 text-sm text-red-300">{data.error}</p>
	{:else if data.countries.length === 0}
		<p class="mt-4 text-sm text-stone-400">Inga rader returnerades. Kör snabbstart-SQL i Supabase först.</p>
	{:else}
		<ul class="mt-4 space-y-1 text-sm">
			{#each data.countries as country}
				<li>{country.name}</li>
			{/each}
		</ul>
	{/if}
</main>
