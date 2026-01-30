<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import LotCard from "$lib/components/public/lots/LotCard.svelte";
	import { Button } from "$lib/components/ui/button/index.js";

	interface Props {
		lots: Lot[];
	}

	let { lots }: Props = $props();
</script>

<section class="py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="text-2xl font-semibold text-foreground">Featured Auctions</h2>
			<Button href="/browse" variant="outline">View all</Button>
		</div>
		<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each lots as lot (lot.id)}
				<LotCard {lot} />
			{/each}
		</div>
	</div>
</section>
