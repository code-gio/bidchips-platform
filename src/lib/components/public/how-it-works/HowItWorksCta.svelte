<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<Card.Root class="mt-10 border border-border bg-card">
	<Card.Content class="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-center md:gap-6">
		<Button href="/sign-up" size="lg">
			Create free account
		</Button>
		<Button href="/browse" variant="outline" size="lg">
			Browse auctions
		</Button>
	</Card.Content>
</Card.Root>
