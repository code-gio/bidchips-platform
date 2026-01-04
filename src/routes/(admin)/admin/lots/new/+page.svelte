<script lang="ts">
  import { onMount } from "svelte";
  import LotForm from "$lib/components/admin/lots/LotForm.svelte";
  import type { Lot } from "$lib/types/lot";
  import type { Category } from "$lib/types/category";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let categories = $state<Category[]>([]);
  let isLoading = $state(false);

  async function handleSave(data: Partial<Lot>, status: "draft" | "scheduled") {
    isLoading = true;
    try {
      const res = await fetch("/api/admin/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(
            status === "draft" ? "Lot saved as draft" : "Lot published successfully"
          );
          goto(`/admin/lots/${result.data.id}`);
        } else {
          throw new Error(result.error || "Failed to save lot");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to save lot");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save lot");
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          categories = data.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  });
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Create New Lot</h1>
    <p class="text-muted-foreground mt-2">
      Create a new auction lot with all the necessary details
    </p>
  </div>

  <LotForm {categories} onSave={handleSave} {isLoading} />
</div>
