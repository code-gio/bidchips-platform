<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();

	const conditionLabel = $derived(
		lot.condition ? lot.condition.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null
	);
</script>

<Card.Root class="overflow-hidden border border-border">
	<a href="/lots/{lot.id}" class="block">
		<div class="aspect-video w-full bg-muted">
			{#if lot.thumbnail_url}
				<img
					src={lot.thumbnail_url}
					alt={lot.title}
					class="h-full w-full object-cover"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
					No image
				</div>
			{/if}
		</div>
	</a>
	<Card.Header class="space-y-1.5 pb-2">
		<div class="flex flex-wrap items-center gap-1.5">
			{#if lot.featured_lot}
				<Badge variant="secondary">Featured</Badge>
			{/if}
			{#if conditionLabel}
				<Badge variant="outline">{conditionLabel}</Badge>
			{/if}
		</div>
		<Card.Title class="line-clamp-2 text-base">
			<a href="/lots/{lot.id}" class="hover:text-primary hover:underline">
				{lot.title}
			</a>
		</Card.Title>
		<Card.Description class="text-muted-foreground text-sm">
			{#if lot.mpn}
				MPN: {lot.mpn}
			{:else if lot.manufacturer}
				{lot.manufacturer}
			{:else}
				—
			{/if}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-2 pt-0">
		<div class="flex items-baseline justify-between gap-2">
			<span class="font-semibold text-foreground">
				${lot.current_price.toLocaleString()}
			</span>
			<span class="text-muted-foreground text-xs">
				{lot.bid_count} bid{lot.bid_count === 1 ? "" : "s"}
			</span>
		</div>
		{#if !lot.hide_time_remaining}
			<p class="text-muted-foreground text-xs">
				Ends {new Date(lot.end_time).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
			</p>
		{/if}
		<Button href="/lots/{lot.id}" variant="outline" size="sm" class="w-full">
			View lot
		</Button>
	</Card.Content>
</Card.Root>
