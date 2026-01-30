<script lang="ts">
	import type { Category } from "$lib/types/category";
	import CategoryCard from "$lib/components/public/categories/CategoryCard.svelte";

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each categories as category (category.id)}
		<CategoryCard {category} />
	{/each}
</div>
