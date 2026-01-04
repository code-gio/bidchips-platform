<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import type { Icon } from "@tabler/icons-svelte";
  import { IconArrowUp, IconArrowDown } from "@tabler/icons-svelte";

  interface Props {
    title: string;
    value: string | number;
    icon?: Icon;
    change?: number; // percentage change
    trend?: "up" | "down";
    loading?: boolean;
    onClick?: () => void;
  }

  let {
    title,
    value,
    icon: IconComponent,
    change,
    trend,
    loading = false,
    onClick,
  }: Props = $props();
</script>

<Card.Root
  class="cursor-pointer transition-shadow hover:shadow-md"
  onclick={onClick}
  role={onClick ? "button" : undefined}
  tabindex={onClick ? 0 : undefined}
>
  <Card.Content class="p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-muted-foreground">{title}</p>
        {#if loading}
          <div class="mt-2 h-8 w-24 animate-pulse rounded bg-muted"></div>
        {:else}
          <p class="mt-2 text-3xl font-bold">{value}</p>
        {/if}
        {#if change !== undefined && !loading}
          <div class="mt-2 flex items-center gap-1">
            {#if trend === "up"}
              <IconArrowUp class="size-4 text-green-600 dark:text-green-400" />
            {:else if trend === "down"}
              <IconArrowDown class="size-4 text-red-600 dark:text-red-400" />
            {/if}
            <span
              class="text-sm font-medium"
              class:text-green-600={trend === "up"}
              class:text-red-600={trend === "down"}
              class:dark:text-green-400={trend === "up"}
              class:dark:text-red-400={trend === "down"}
            >
              {Math.abs(change)}%
            </span>
            <span class="text-sm text-muted-foreground">vs last period</span>
          </div>
        {/if}
      </div>
      {#if IconComponent}
        <div class="rounded-lg bg-primary/10 p-3">
          <IconComponent class="size-6 text-primary" />
        </div>
      {/if}
    </div>
  </Card.Content>
</Card.Root>

