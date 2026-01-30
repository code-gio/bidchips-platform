<script lang="ts">
	import ContactForm from "$lib/components/public/contact/ContactForm.svelte";
	import ContactInfo from "$lib/components/public/contact/ContactInfo.svelte";
</script>

<svelte:head>
	<title>Contact | BidChips Auction</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-2 text-3xl font-semibold text-foreground">Contact</h1>
	<p class="mb-8 text-muted-foreground">
		Have a question or feedback? Send us a message and we'll get back to you.
	</p>
	<div class="grid gap-8 lg:grid-cols-[1fr_340px]">
		<ContactForm />
		<ContactInfo />
	</div>
</div>
