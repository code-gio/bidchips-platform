<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import { Badge } from "$lib/components/ui/badge/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();

	const conditionLabel = $derived(
		lot.condition ? lot.condition.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null
	);
</script>

<div class="space-y-3">
	<h1 class="text-2xl font-semibold text-foreground md:text-3xl">
		{lot.title}
	</h1>
	{#if lot.mpn || lot.manufacturer}
		<p class="text-muted-foreground">
			{#if lot.mpn}
				<span>MPN: {lot.mpn}</span>
			{/if}
			{#if lot.mpn && lot.manufacturer}
				<span class="mx-1">·</span>
			{/if}
			{#if lot.manufacturer}
				<span>{lot.manufacturer}</span>
			{/if}
		</p>
	{/if}
	<div class="flex flex-wrap items-center gap-2">
		{#if conditionLabel}
			<Badge variant="outline">{conditionLabel}</Badge>
		{/if}
		<Badge variant="secondary">Qty: {lot.quantity}</Badge>
	</div>
	<div class="flex items-baseline gap-2">
		<span class="text-2xl font-semibold text-foreground">
			${lot.current_price.toLocaleString()}
		</span>
		<span class="text-muted-foreground text-sm">
			Current bid · {lot.bid_count} bid{lot.bid_count === 1 ? "" : "s"}
		</span>
	</div>
	{#if !lot.hide_time_remaining}
		<p class="text-muted-foreground text-sm">
			Ends {new Date(lot.end_time).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
		</p>
	{/if}
</div>
