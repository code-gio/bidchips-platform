<script lang="ts">
	import { page } from "$app/state";
	import LotDetailGallery from "$lib/components/public/lots/LotDetailGallery.svelte";
	import LotDetailInfo from "$lib/components/public/lots/LotDetailInfo.svelte";
	import LotBidBox from "$lib/components/public/lots/LotBidBox.svelte";
	import LotDescription from "$lib/components/public/lots/LotDescription.svelte";
	import LotSpecsTable from "$lib/components/public/lots/LotSpecsTable.svelte";
	import { createMockLot } from "$lib/components/public/lots/mock-lot";

	const lotId = $derived(page.params.id);
	const lot = $derived(createMockLot(lotId));
</script>

<svelte:head>
	<title>{lot.title} | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
		<div class="space-y-6">
			<LotDetailGallery {lot} />
			<div class="lg:hidden">
				<LotBidBox {lot} />
			</div>
			<LotDescription {lot} />
			<LotSpecsTable {lot} />
		</div>
		<aside class="lg:sticky lg:top-24 lg:self-start">
			<div class="space-y-6">
				<LotDetailInfo {lot} />
				<div class="hidden lg:block">
					<LotBidBox {lot} />
				</div>
			</div>
		</aside>
	</div>
</div>
