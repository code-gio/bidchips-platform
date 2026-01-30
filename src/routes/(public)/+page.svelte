<script lang="ts">
	import Hero from "$lib/components/public/home/hero.svelte";
	import FeaturedLots from "$lib/components/public/home/FeaturedLots.svelte";
	import CategoriesPreview from "$lib/components/public/home/CategoriesPreview.svelte";
	import HomeCta from "$lib/components/public/home/HomeCta.svelte";
	import { createMockLots } from "$lib/components/public/lots/mock-lot";
	import { createMockCategories } from "$lib/components/public/categories/mock-category";

	const mockLots = createMockLots(6);
	const mockCategories = createMockCategories();
</script>

<Hero />
<FeaturedLots lots={mockLots} />
<CategoriesPreview categories={mockCategories} />
<HomeCta />