<script lang="ts">
  import { onMount } from "svelte";
  import CategoriesTable from "$lib/components/admin/categories/CategoriesTable.svelte";
  import CreateCategoryModal from "$lib/components/admin/categories/CreateCategoryModal.svelte";
  import EditCategoryModal from "$lib/components/admin/categories/EditCategoryModal.svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Category } from "$lib/types/category";
  import { IconPlus, IconCategory } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import ConfirmDialog from "$lib/components/admin/shared/ConfirmDialog.svelte";

  let categories = $state<Category[]>([]);
  let isLoading = $state(true);
  let showCreateModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteDialog = $state(false);
  let selectedCategory = $state<Category | null>(null);
  let categoryToDelete = $state<Category | null>(null);

  onMount(async () => {
    await fetchCategories();
    isLoading = false;
  });

  async function fetchCategories() {
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
      toast.error("Failed to load categories");
    }
  }

  async function handleCreate(data: Partial<Category>) {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Category created successfully");
          await fetchCategories();
        } else {
          throw new Error(result.error || "Failed to create category");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to create category");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
      throw error;
    }
  }

  async function handleUpdate(data: Partial<Category>) {
    if (!selectedCategory) return;
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Category updated successfully");
          await fetchCategories();
        } else {
          throw new Error(result.error || "Failed to update category");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update category");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
      throw error;
    }
  }

  async function handleDelete() {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("Category deleted successfully");
          await fetchCategories();
        } else {
          throw new Error(result.error || "Failed to delete category");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete category");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
      throw error;
    }
    showDeleteDialog = false;
    categoryToDelete = null;
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (res.ok) {
        await fetchCategories();
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      throw error;
    }
  }

  function handleEdit(category: Category) {
    selectedCategory = category;
    showEditModal = true;
  }

  function handleDeleteClick(category: Category) {
    categoryToDelete = category;
    showDeleteDialog = true;
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Categories</h1>
      <p class="text-muted-foreground mt-2">
        Manage product categories for organizing auction lots
      </p>
    </div>
    <Button onclick={() => {
      showCreateModal = true;
    }}>
      <IconPlus class="size-4" />
      Create Category
    </Button>
  </div>

  {#if isLoading}
    <div class="space-y-2">
      {#each Array(5) as _}
        <div class="h-16 animate-pulse rounded bg-muted"></div>
      {/each}
    </div>
  {:else if categories.length === 0}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCategory />
        </Empty.Media>
        <Empty.Title>No Categories</Empty.Title>
        <Empty.Description>
          Get started by creating your first category to organize your auction lots.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onclick={() => {
          showCreateModal = true;
        }}>
          Create Category
        </Button>
      </Empty.Content>
    </Empty.Root>
  {:else}
    <CategoriesTable
      {categories}
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
      onToggleActive={handleToggleActive}
    />
  {/if}
</div>

<!-- Create Modal -->
<CreateCategoryModal
  bind:open={showCreateModal}
  {categories}
  onConfirm={handleCreate}
  onCancel={() => {
    showCreateModal = false;
  }}
/>

<!-- Edit Modal -->
<EditCategoryModal
  bind:open={showEditModal}
  category={selectedCategory}
  {categories}
  onUpdate={handleUpdate}
  onDelete={async () => {
    if (selectedCategory) {
      categoryToDelete = selectedCategory;
      showEditModal = false;
      showDeleteDialog = true;
    }
  }}
  onCancel={() => {
    selectedCategory = null;
    showEditModal = false;
  }}
/>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Category"
  description="Are you sure you want to delete '{categoryToDelete?.name}'? This action cannot be undone. Categories with lots cannot be deleted."
  variant="danger"
  confirmText="Delete"
  onConfirm={handleDelete}
/>
