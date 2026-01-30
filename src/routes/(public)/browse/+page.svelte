<script lang="ts">
	import BrowseFilters from "$lib/components/public/browse/BrowseFilters.svelte";
	import LotGrid from "$lib/components/public/browse/LotGrid.svelte";
	import BrowseEmpty from "$lib/components/public/browse/BrowseEmpty.svelte";
	import { createMockLots } from "$lib/components/public/lots/mock-lot";

	const mockLots = createMockLots(9);
	const showEmpty = $state(false);
</script>

<svelte:head>
	<title>Browse Auctions | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-semibold text-foreground">Browse Auctions</h1>
	<div class="grid gap-8 lg:grid-cols-[280px_1fr]">
		<aside class="hidden lg:sticky lg:top-20 lg:block lg:self-start">
			<BrowseFilters />
		</aside>
		<div>
			{#if showEmpty}
				<BrowseEmpty />
			{:else}
				<LotGrid lots={mockLots} />
			{/if}
		</div>
	</div>
</div>
