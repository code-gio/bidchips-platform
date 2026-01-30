<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import LotCard from "$lib/components/public/lots/LotCard.svelte";

	interface Props {
		lots: Lot[];
	}

	let { lots }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each lots as lot (lot.id)}
		<LotCard {lot} />
	{/each}
</div>
