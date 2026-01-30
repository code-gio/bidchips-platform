<script lang="ts">
	import type { Lot } from "$lib/types/lot";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	interface Props {
		lot: Lot;
	}

	let { lot }: Props = $props();

	const conditionLabel = $derived(
		lot.condition ? lot.condition.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"
	);

	const specs = $derived([
		{ label: "MPN", value: lot.mpn ?? "—" },
		{ label: "Manufacturer", value: lot.manufacturer ?? "—" },
		{ label: "Condition", value: conditionLabel },
		{ label: "Quantity", value: lot.quantity.toString() },
		{ label: "Starting price", value: `$${lot.starting_price.toLocaleString()}` },
		{ label: "Bid increment", value: `$${lot.bid_increment.toLocaleString()}` },
	]);
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Specifications</Card.Title>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Body>
				{#each specs as { label, value }}
					<Table.Row>
						<Table.Cell class="font-medium text-muted-foreground">{label}</Table.Cell>
						<Table.Cell class="text-foreground">{value}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
