<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();

	let bidAmount = $state("");
	const minBid = $derived(lot.current_price + lot.bid_increment);
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Place a bid</Card.Title>
		<Card.Description>
			Minimum bid: ${minBid.toLocaleString()}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<Label for="bid-amount">Your bid ($)</Label>
			<Input
				id="bid-amount"
				type="number"
				min={minBid}
				step={lot.bid_increment}
				placeholder={minBid.toString()}
				bind:value={bidAmount}
			/>
		</div>
		<Button class="w-full" size="lg">
			Place bid
		</Button>
		{#if lot.allow_offers}
			<Button variant="outline" class="w-full" size="lg">
				Make an offer
			</Button>
		{/if}
		<Button variant="ghost" class="w-full">
			Add to watchlist
		</Button>
	</Card.Content>
</Card.Root>
