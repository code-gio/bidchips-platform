<script lang="ts">
  import { onMount } from "svelte";
  import LogoUploader from "$lib/components/admin/settings/LogoUploader.svelte";
  import ColorPicker from "$lib/components/admin/settings/ColorPicker.svelte";
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

  async function handleLogoUpload(file: File) {
    const formData = new FormData();
    formData.append("logo", file);

    const res = await fetch("/api/admin/settings/logo", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        await fetchSettings();
      } else {
        throw new Error(result.error || "Failed to upload logo");
      }
    } else {
      const error = await res.json();
      throw new Error(error.error || "Failed to upload logo");
    }
  }

  async function handleLogoRemove() {
    const res = await fetch("/api/admin/settings/logo", {
      method: "DELETE",
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        await fetchSettings();
      } else {
        throw new Error(result.error || "Failed to remove logo");
      }
    } else {
      const error = await res.json();
      throw new Error(error.error || "Failed to remove logo");
    }
  }

  async function handleColorSave(color: string) {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_color: color }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          settings = result.data;
        } else {
          throw new Error(result.error || "Failed to save color");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to save color");
      }
    } catch (error: any) {
      throw error;
    }
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Branding & Logo</h1>
    <p class="text-muted-foreground mt-2">
      Customize your site's logo and brand colors
    </p>
  </div>

  {#if isLoading}
    <div class="space-y-4">
      {#each Array(2) as _}
        <div class="h-48 animate-pulse rounded-lg bg-muted"></div>
      {/each}
    </div>
  {:else if settings}
    <div class="grid gap-6 md:grid-cols-2">
      <LogoUploader
        currentLogoUrl={settings.logo_url}
        onUpload={handleLogoUpload}
        onRemove={handleLogoRemove}
      />
      <ColorPicker currentColor={settings.primary_color} onSave={handleColorSave} />
    </div>
  {/if}
</div>
