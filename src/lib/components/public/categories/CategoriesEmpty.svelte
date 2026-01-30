<script lang="ts">
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Empty.Root class="border border-dashed border-border rounded-lg bg-muted/30">
	<Empty.Header>
		<Empty.Title>No categories yet</Empty.Title>
		<Empty.Description>
			Categories will appear here once they are added to the platform.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<Button href="/browse" variant="outline">Browse all lots</Button>
	</Empty.Content>
</Empty.Root>
