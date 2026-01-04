<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { siteConfig } from "$lib/config";
</script>

<section class="relative py-12 md:py-16 lg:py-20">
  <div class="w-full max-w-7xl mx-auto">
    <div class="flex flex-col items-center gap-2">
      <p class="font-medium text-foreground text-center">
        Welcome to Bid Chips by iBuyXS
      </p>
      <h1 class="font-semibold text-5xl leading-tight text-center">
        Electronic Components Auction Platform
      </h1>
      <p
        class="font-normal text-muted-foreground text-center max-w-2xl mx-auto"
      >
        Discover and bid on electronic components through our seamless auction
        platform. Find the components you need at competitive prices from
        trusted sellers worldwide.
      </p>
      <p class="font-normal text-muted-foreground text-center text-sm">
        New to BidChips?
        <a
          href="/how-it-works"
          class="text-primary hover:underline font-medium"
        >
          Learn how it works in just a few minutes.
        </a>
      </p>
      <div
        class="flex flex-col min-[550px]:flex-row items-center justify-center gap-2 mt-6"
      >
        <Button href="/browse" size="lg" class="rounded-full">
          Browse Auctions
        </Button>
        <Button
          href="/how-it-works"
          variant="outline"
          size="lg"
          class="rounded-full"
        >
          How It Works
        </Button>
      </div>
      <div class="border border-border rounded-3xl mt-10">
        <img
          src="https://pagedone.io/asset/uploads/1709274834.png"
          alt="Hero"
          class="hidden sm:block w-full h-auto rounded-2xl object-cover"
        />
        <img
          src="https://pagedone.io/asset/uploads/1710392782.png"
          alt="Hero mobile"
          class="sm:hidden w-full h-auto rounded-2xl object-cover"
        />
      </div>
    </div>
  </div>
</section>
