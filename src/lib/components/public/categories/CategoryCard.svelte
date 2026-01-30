<script lang="ts">
	import type { Category } from "$lib/types/category";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	interface Props {
		category: Category;
	}

	let { category }: Props = $props();

	const lotCount = $derived(category.active_lot_count ?? category.lot_count ?? 0);
</script>

<Card.Root class="h-full overflow-hidden border border-border transition-colors hover:border-primary/50">
	<a href="/browse?category_id={category.id}" class="block">
		{#if category.image_url}
			<div class="aspect-video w-full bg-muted">
				<img
					src={category.image_url}
					alt={category.name}
					class="h-full w-full object-cover"
				/>
			</div>
		{:else}
			<div
				class="aspect-video w-full"
				style={category.color ? `background-color: ${category.color}; opacity: 0.8` : undefined}
			>
				{#if !category.color}
					<div class="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-4xl">
						—
					</div>
				{/if}
			</div>
		{/if}
	</a>
	<Card.Header>
		<Card.Title class="text-lg">
			<a href="/browse?category_id={category.id}" class="hover:text-primary hover:underline">
				{category.name}
			</a>
		</Card.Title>
		{#if category.description}
			<Card.Description class="line-clamp-2 text-muted-foreground text-sm">
				{category.description}
			</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content class="pt-0">
		<div class="flex items-center justify-between">
			<Badge variant="secondary">{lotCount} lots</Badge>
			<Button href="/browse?category_id={category.id}" variant="ghost" size="sm">
				Browse
			</Button>
		</div>
	</Card.Content>
</Card.Root>
