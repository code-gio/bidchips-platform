<script lang="ts">
	import type { Category } from "$lib/types/category";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();
</script>

<section class="border-t border-border bg-muted/30 py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="text-2xl font-semibold text-foreground">Browse by Category</h2>
			<Button href="/categories" variant="outline">All categories</Button>
		</div>
		<div class="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each categories as category (category.id)}
				<a href="/browse?category_id={category.id}">
					<Card.Root class="h-full border border-border transition-colors hover:bg-accent/50">
						<Card.Content class="flex flex-col items-center gap-2 p-6 text-center">
							{#if category.image_url}
								<img
									src={category.image_url}
									alt={category.name}
									class="h-12 w-12 rounded-md object-cover"
								/>
							{:else}
								<div
									class="h-12 w-12 rounded-md bg-muted"
									style={category.color ? `background-color: ${category.color}` : undefined}
								/>
							{/if}
							<span class="font-medium text-foreground">{category.name}</span>
							<span class="text-muted-foreground text-sm">
								{category.active_lot_count ?? category.lot_count ?? 0} lots
							</span>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	</div>
</section>
