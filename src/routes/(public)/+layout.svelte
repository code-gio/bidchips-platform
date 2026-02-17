<script lang="ts">
  import NavPublic from "$lib/components/nav/public/nav-public.svelte";
  import FooterPublic from "$lib/components/nav/public/footer-public.svelte";
  let { data, children } = $props();
</script>

<NavPublic session={data.session} />
<main class="pt-16">
  {@render children()}
</main>
<FooterPublic />
