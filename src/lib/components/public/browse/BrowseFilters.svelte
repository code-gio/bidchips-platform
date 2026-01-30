<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	let search = $state("");
	let categoryValue = $state<string | undefined>(undefined);
	let minPrice = $state("");
	let maxPrice = $state("");
	let conditionValue = $state<string | undefined>(undefined);
	let featuredOnly = $state(false);

	const categoryLabels: Record<string, string> = {
		"cat-1": "Microcontrollers",
		"cat-2": "Resistors",
		"cat-3": "Capacitors",
		"cat-4": "Connectors",
	};
	const conditionLabels: Record<string, string> = {
		new: "New",
		used: "Used",
		refurbished: "Refurbished",
		"for-parts": "For parts",
	};
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Filters</Card.Title>
		<Card.Description>Refine your search</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<Label for="search">Search</Label>
			<Input
				id="search"
				type="search"
				placeholder="Title, MPN, manufacturer..."
				bind:value={search}
			/>
		</div>
		<div class="space-y-2">
			<Label>Category</Label>
			<Select.Root
				type="single"
				bind:value={categoryValue}
				onValueChange={(v) => {
					categoryValue = v;
				}}
			>
				<Select.Trigger class="w-full">
					<span class="truncate">
						{categoryValue ? categoryLabels[categoryValue] ?? categoryValue : "All categories"}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="cat-1">Microcontrollers</Select.Item>
					<Select.Item value="cat-2">Resistors</Select.Item>
					<Select.Item value="cat-3">Capacitors</Select.Item>
					<Select.Item value="cat-4">Connectors</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for="min-price">Min price ($)</Label>
				<Input
					id="min-price"
					type="number"
					min="0"
					placeholder="0"
					bind:value={minPrice}
				/>
			</div>
			<div class="space-y-2">
				<Label for="max-price">Max price ($)</Label>
				<Input
					id="max-price"
					type="number"
					min="0"
					placeholder="Any"
					bind:value={maxPrice}
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label>Condition</Label>
			<Select.Root
				type="single"
				bind:value={conditionValue}
				onValueChange={(v) => {
					conditionValue = v;
				}}
			>
				<Select.Trigger class="w-full">
					<span class="truncate">
						{conditionValue ? conditionLabels[conditionValue] ?? conditionValue : "Any condition"}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="new">New</Select.Item>
					<Select.Item value="used">Used</Select.Item>
					<Select.Item value="refurbished">Refurbished</Select.Item>
					<Select.Item value="for-parts">For parts</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox id="featured" bind:checked={featuredOnly} />
			<Label for="featured" class="cursor-pointer text-sm font-normal">Featured only</Label>
		</div>
		<Button variant="outline" class="w-full">Apply filters</Button>
	</Card.Content>
</Card.Root>
