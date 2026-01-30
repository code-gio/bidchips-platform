<script lang="ts">
	import CategoryGrid from "$lib/components/public/categories/CategoryGrid.svelte";
	import CategoriesEmpty from "$lib/components/public/categories/CategoriesEmpty.svelte";
	import { createMockCategories } from "$lib/components/public/categories/mock-category";

	const mockCategories = createMockCategories();
	const showEmpty = $state(false);
</script>

<svelte:head>
	<title>Categories | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-semibold text-foreground">Categories</h1>
	{#if showEmpty}
		<CategoriesEmpty />
	{:else}
		<CategoryGrid categories={mockCategories} />
	{/if}
</div>
