<script lang="ts">
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Empty.Root class="border border-dashed border-border rounded-lg bg-muted/30">
	<Empty.Header>
		<Empty.Title>No lots found</Empty.Title>
		<Empty.Description>
			Try adjusting your filters or search terms to find what you're looking for.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<Button variant="outline">Clear filters</Button>
	</Empty.Content>
</Empty.Root>
