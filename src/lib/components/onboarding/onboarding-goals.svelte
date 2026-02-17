<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";

  const goals = [
    {
      id: "buyer",
      title: "Buyer",
      description: "I want to find and purchase properties.",
      img: "/onboarding/img-buyer.png",
      rotate: 10,
      right: "-8%",
      top: "-10%",
    },
    {
      id: "seller",
      title: "Seller",
      description: "I want to list and sell properties.",
      img: "/onboarding/img-seller.png",
      rotate: 10,
      right: "-5%",
      top: "-15%",
    },
    // {
    //   id: "refer",
    //   title: "Refer and earn",
    //   description: "I want to refer others and earn rewards.",
    //   img: "/onboarding/img-seller.png",
    //   rotate: 120,
    //   right: "40%",
    //   top: "-65%",
    // },
    // {
    //   id: "project-management",
    //   title: "Project management",
    //   description: "I want to manage real estate projects.",
    //   img: "/onboarding/img-buyer.png",
    //   rotate: 160,
    //   right: "40%",
    //   top: "-125%",
    // },
  ] as const;

  let {
    selectedGoal = $bindable(null as string | null),
    onContinue,
  }: {
    selectedGoal?: string | null;
    onContinue: () => void;
  } = $props();
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col items-center">
  <div class="mb-8 text-center">
    <h1
      class="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-[55px]"
    >
      What are your goals?
    </h1>
    <p class="mt-3 text-muted-foreground font-semibold">
      Choose the option that best describes what you want to do.
    </p>
  </div>

  <div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
    {#each goals as goal (goal.id)}
      <button
        type="button"
        class="relative flex min-h-[140px] flex-col items-start justify-between overflow-hidden rounded-xl border bg-card p-6 text-left shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selected]:border-primary data-[selected]:ring-2 data-[selected]:ring-ring"
        data-selected={selectedGoal === goal.id ? "" : undefined}
        onclick={() =>
          (selectedGoal = selectedGoal === goal.id ? null : goal.id)}
      >
        <div class="relative z-10 flex flex-col gap-1">
          <span class="text-2xl font-semibold text-foreground"
            >{goal.title}</span
          >
          <span class="text-sm text-muted-foreground">{goal.description}</span>
        </div>
        <!-- Imagen anclada abajo-derecha, sobresaliendo; el overflow-hidden del botón la recorta con el borde redondeado -->
        <div
          class="pointer-events-none absolute flex items-end justify-end"
          style="right: {goal.right}; top: {goal.top}; width: 180px; height: 220px; transform: rotate({goal.rotate}deg); transform-origin: 100% 100%;"
          aria-hidden="true"
        >
          <img
            src={goal.img}
            alt=""
            class="h-[220px] w-[220px] object-contain object-bottom-right"
          />
        </div>
      </button>
    {/each}
  </div>

  <Button
    type="button"
    variant="default"
    class="mt-8 min-w-[140px] cursor-pointer"
    onclick={onContinue}
  >
    Continue
  </Button>
</div>
