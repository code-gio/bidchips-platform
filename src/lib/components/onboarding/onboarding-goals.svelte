<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";

  const goals = [
    {
      id: "buyer",
      title: "Buyer",
      description: "I want to find and purchase properties.",
    },
    {
      id: "seller",
      title: "Seller",
      description: "I want to list and sell properties.",
    },
    {
      id: "refer",
      title: "Refer and earn",
      description: "I want to refer others and earn rewards.",
    },
    {
      id: "project-management",
      title: "Project management",
      description: "I want to manage real estate projects.",
    },
  ] as const;

  let { selectedGoal = $bindable(null as string | null), onContinue }: {
    selectedGoal?: string | null;
    onContinue: () => void;
  } = $props();
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col items-center">
  <div class="mb-8 text-center">
    <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      What are your goals?
    </h1>
    <p class="mt-2 text-muted-foreground">
      Choose the option that best describes what you want to do.
    </p>
  </div>

  <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
    {#each goals as goal (goal.id)}
      <button
        type="button"
        class="relative flex flex-col items-start justify-between overflow-hidden rounded-lg border bg-card p-4 text-left shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selected]:border-primary data-[selected]:ring-2 data-[selected]:ring-ring"
        data-selected={selectedGoal === goal.id ? "" : undefined}
        onclick={() => (selectedGoal = selectedGoal === goal.id ? null : goal.id)}
      >
        <div class="relative z-10 flex flex-col gap-1">
          <span class="font-semibold text-foreground">{goal.title}</span>
          <span class="text-sm text-muted-foreground">{goal.description}</span>
        </div>
        <div
          class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-80"
          style="background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--muted-foreground) / 0.08));"
          aria-hidden="true"
        />
      </button>
    {/each}
  </div>

  <Button type="button" class="mt-8 min-w-[140px]" onclick={onContinue}>
    Continue
  </Button>
</div>
