<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Field, FieldContent, FieldLabel } from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	let name = $state("");
	let email = $state("");
	let subject = $state("");
	let message = $state("");
</script>

<Card.Root class="border border-border">
	<Card.Header>
		<Card.Title>Send a message</Card.Title>
		<Card.Description>We'll get back to you as soon as we can.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<Field>
			<FieldLabel for="contact-name">Name</FieldLabel>
			<FieldContent>
				<Input id="contact-name" type="text" placeholder="Your name" bind:value={name} />
			</FieldContent>
		</Field>
		<Field>
			<FieldLabel for="contact-email">Email</FieldLabel>
			<FieldContent>
				<Input id="contact-email" type="email" placeholder="you@example.com" bind:value={email} />
			</FieldContent>
		</Field>
		<Field>
			<FieldLabel for="contact-subject">Subject</FieldLabel>
			<FieldContent>
				<Input id="contact-subject" type="text" placeholder="What is this about?" bind:value={subject} />
			</FieldContent>
		</Field>
		<Field>
			<FieldLabel for="contact-message">Message</FieldLabel>
			<FieldContent>
				<textarea
					id="contact-message"
					rows="4"
					placeholder="Your message..."
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					bind:value={message}
				/>
			</FieldContent>
		</Field>
		<Button type="button">Send message</Button>
	</Card.Content>
</Card.Root>
