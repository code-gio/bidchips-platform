<script lang="ts">
	import HowItWorksSteps from "$lib/components/public/how-it-works/HowItWorksSteps.svelte";
	import HowItWorksCta from "$lib/components/public/how-it-works/HowItWorksCta.svelte";
</script>

<svelte:head>
	<title>How It Works | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-2 text-3xl font-semibold text-foreground">How It Works</h1>
	<p class="mb-8 max-w-2xl text-muted-foreground">
		BidChips is an auction platform for electronic components. Here’s how to get started in four simple steps.
	</p>
	<HowItWorksSteps />
	<HowItWorksCta />
</div>
