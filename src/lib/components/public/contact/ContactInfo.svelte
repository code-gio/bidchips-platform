<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Contact information</Card.Title>
		<Card.Description>Reach us by email or visit the support center.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div>
			<p class="text-muted-foreground text-sm">Email</p>
			<a href="mailto:support@bidchips.com" class="font-medium text-foreground hover:text-primary hover:underline">
				support@bidchips.com
			</a>
		</div>
		<div>
			<p class="text-muted-foreground text-sm">Support</p>
			<p class="text-foreground">For help with your account, bids, or orders, visit the Help Center.</p>
			<Button href="/help" variant="outline" class="mt-2">
				Help Center
			</Button>
		</div>
	</Card.Content>
</Card.Root>
