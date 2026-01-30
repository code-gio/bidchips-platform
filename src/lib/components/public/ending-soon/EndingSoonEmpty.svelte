<script lang="ts">
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Empty.Root class="border border-dashed border-border rounded-lg bg-muted/30">
	<Empty.Header>
		<Empty.Title>No auctions ending soon</Empty.Title>
		<Empty.Description>
			Check back later or browse all active auctions to find lots that are closing soon.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<Button href="/browse" variant="outline">Browse auctions</Button>
	</Empty.Content>
</Empty.Root>
