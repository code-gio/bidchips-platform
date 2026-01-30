<script lang="ts">
	import LotGrid from "$lib/components/public/browse/LotGrid.svelte";
	import EndingSoonEmpty from "$lib/components/public/ending-soon/EndingSoonEmpty.svelte";
	import { createMockLots } from "$lib/components/public/lots/mock-lot";

	const mockLots = createMockLots(6);
	const showEmpty = $state(false);
</script>

<svelte:head>
	<title>Ending Soon | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-semibold text-foreground">Ending Soon</h1>
	<p class="mb-6 text-muted-foreground">
		Auctions closing in the next 24 hours. Place your bid before time runs out.
	</p>
	{#if showEmpty}
		<EndingSoonEmpty />
	{:else}
		<LotGrid lots={mockLots} />
	{/if}
</div>
