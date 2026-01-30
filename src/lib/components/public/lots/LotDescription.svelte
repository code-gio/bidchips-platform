<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import * as Card from "$lib/components/ui/card/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Description</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if lot.description}
			<div class="prose prose-sm max-w-none text-foreground dark:prose-invert">
				<p class="whitespace-pre-wrap">{lot.description}</p>
			</div>
		{:else}
			<p class="text-muted-foreground">No description provided.</p>
		{/if}
	</Card.Content>
</Card.Root>
