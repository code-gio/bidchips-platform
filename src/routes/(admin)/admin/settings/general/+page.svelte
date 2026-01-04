<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import GeneralSettingsForm from "$lib/components/admin/settings/GeneralSettingsForm.svelte";
  import type { SiteSettings } from "$lib/types/settings";
  import { toast } from "svelte-sonner";

  let settings = $state<SiteSettings | null>(null);
  let isLoading = $state(true);

  onMount(async () => {
    await fetchSettings();
    isLoading = false;
  });

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          settings = data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    }
  }

  async function handleSave(data: Partial<SiteSettings>) {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          settings = result.data;
        } else {
          throw new Error(result.error || "Failed to save settings");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to save settings");
      }
    } catch (error: any) {
      throw error;
    }
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">General Settings</h1>
    <p class="text-muted-foreground mt-2">
      Configure your site's general information and contact details
    </p>
  </div>

  {#if isLoading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-32 animate-pulse rounded-lg bg-muted"></div>
      {/each}
    </div>
  {:else}
    <Card.Root>
      <Card.Content class="pt-6">
        <GeneralSettingsForm {settings} onSave={handleSave} />
      </Card.Content>
    </Card.Root>
  {/if}
</div>
