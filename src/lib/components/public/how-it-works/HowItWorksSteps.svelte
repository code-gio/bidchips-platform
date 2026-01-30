<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

	const steps = [
		{
			number: 1,
			title: "Create an account",
			description: "Sign up for free. You only need an email to start browsing and bidding on electronic components.",
		},
		{
			number: 2,
			title: "Browse & search",
			description: "Find lots by category, keyword, or MPN. Filter by condition, price range, and ending time.",
		},
		{
			number: 3,
			title: "Place bids or make offers",
			description: "Bid in real time on auctions or submit an offer on lots that allow it. Set a watchlist to get notified when lots are ending soon.",
		},
		{
			number: 4,
			title: "Win and complete the sale",
			description: "If you win, you'll receive instructions to complete payment and shipping. Sellers ship directly to you.",
		},
	];
</script>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	{#each steps as step}
		<Card.Root class="border border-border">
			<Card.Header>
				<Badge variant="secondary" class="mb-2 w-fit">
					Step {step.number}
				</Badge>
				<Card.Title class="text-lg">{step.title}</Card.Title>
				<Card.Description class="text-muted-foreground text-sm">
					{step.description}
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{/each}
</div>
