<script lang="ts">
  let { children } = $props();
</script>

<main class="flex min-h-[100dvh] flex-col bg-muted/30">
  <div class="flex flex-1 items-center justify-center p-6">
    {@render children()}
  </div>
</main>
