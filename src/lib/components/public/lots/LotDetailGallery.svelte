<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import * as Card from "$lib/components/ui/card/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();

	const images = $derived(lot.images?.length ? lot.images : (lot.thumbnail_url ? [lot.thumbnail_url] : []));
	const mainImage = $derived(images[0] ?? null);
</script>

<Card.Root class="overflow-hidden border border-border">
	<Card.Content class="p-0">
		<div class="aspect-video w-full bg-muted">
			{#if mainImage}
				<img
					src={mainImage}
					alt={lot.title}
					class="h-full w-full object-contain"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-muted-foreground">
					No image
				</div>
			{/if}
		</div>
		{#if images.length > 1}
			<div class="flex gap-2 overflow-x-auto border-t border-border p-2">
				{#each images as src}
					<button
						type="button"
						class="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
					>
						<img src={src} alt="" class="h-full w-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
