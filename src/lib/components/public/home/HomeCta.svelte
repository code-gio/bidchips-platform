<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<section class="py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<Card.Root class="border border-border bg-card text-center">
			<Card.Content class="flex flex-col items-center gap-4 p-8 md:p-12">
				<h2 class="text-2xl font-semibold text-foreground md:text-3xl">
					Ready to start bidding?
				</h2>
				<p class="max-w-xl text-muted-foreground">
					Create a free account to place bids, make offers, and add lots to your watchlist.
				</p>
				<div class="flex flex-wrap items-center justify-center gap-3">
					<Button href="/sign-up" size="lg">
						Create account
					</Button>
					<Button href="/browse" variant="outline" size="lg">
						Browse auctions
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</section>
