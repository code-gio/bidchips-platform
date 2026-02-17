<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    IconGavel,
    IconHeart,
    IconMoneybag,
    IconTrophy,
    IconBell,
  } from "@tabler/icons-svelte";

  const quickLinks = [
    {
      title: "My Bids",
      href: "/account/bids",
      icon: IconGavel,
      description: "View active bids and history",
    },
    {
      title: "Watchlist",
      href: "/account/watchlist",
      icon: IconHeart,
      description: "Lots you're watching",
    },
    {
      title: "My Offers",
      href: "/account/offers",
      icon: IconMoneybag,
      description: "Pending and past offers",
    },
    {
      title: "Won Lots",
      href: "/account/won",
      icon: IconTrophy,
      description: "Auctions you've won",
    },
    {
      title: "Notifications",
      href: "/account/notifications",
      icon: IconBell,
      description: "Alerts and updates",
    },
  ];
</script>

<div class="space-y-6 max-w-7xl">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
    <p class="text-muted-foreground mt-1">
      Welcome back. Here's a quick overview of your activity.
    </p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each quickLinks as link (link.href)}
      <Card.Root class="transition-colors hover:bg-muted/50">
        <Card.Header class="flex flex-row items-center gap-2">
          <link.icon class="size-5 text-muted-foreground" />
          <Card.Title class="text-base">{link.title}</Card.Title>
        </Card.Header>
        <Card.Content>
          <p class="text-sm text-muted-foreground">{link.description}</p>
          <Button href={link.href} variant="secondary" class="mt-3" size="sm">
            Open
          </Button>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
