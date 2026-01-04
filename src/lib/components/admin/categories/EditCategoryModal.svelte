<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Checkbox from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Category } from "$lib/types/category";
  import { IconTrash } from "@tabler/icons-svelte";

  interface Props {
    open?: boolean;
    category: Category | null;
    categories?: Category[];
    onUpdate: (data: Partial<Category>) => Promise<void>;
    onDelete?: () => Promise<void>;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    category,
    categories = [],
    onUpdate,
    onDelete,
    onCancel,
  }: Props = $props();

  let name = $state("");
  let slug = $state("");
  let description = $state("");
  let icon = $state("");
  let color = $state("#000000");
  let parentId = $state<string>("");
  let isActive = $state(true);
  let isSubmitting = $state(false);
  let isDeleting = $state(false);
  let errors = $state<Record<string, string>>({});

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function validate(): boolean {
    errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!slug.trim()) errors.slug = "Slug is required";
    return Object.keys(errors).length === 0;
  }

  async function handleUpdate() {
    if (!category) return;
    if (!validate()) return;
    isSubmitting = true;
    try {
      await onUpdate({
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        description: description.trim() || null,
        icon: icon.trim() || null,
        color: color || null,
        parent_id: parentId || null,
        is_active: isActive,
      });
      open = false;
    } catch (error: any) {
      errors.submit = error.message || "Failed to update category";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDelete() {
    if (!category || !onDelete) return;
    isDeleting = true;
    try {
      await onDelete();
      open = false;
    } catch (error: any) {
      errors.submit = error.message || "Failed to delete category";
    } finally {
      isDeleting = false;
    }
  }

  function handleCancel() {
    open = false;
    onCancel?.();
  }

  // Populate form when category changes
  $effect(() => {
    if (category && open) {
      name = category.name;
      slug = category.slug;
      description = category.description || "";
      icon = category.icon || "";
      color = category.color || "#000000";
      parentId = category.parent_id || "";
      isActive = category.is_active;
      errors = {};
    }
  });
</script>

<Drawer.Root bind:open>
  <Drawer.Content class="sm:max-w-md">
    <Drawer.Header>
      <Drawer.Title>Edit Category</Drawer.Title>
      <Drawer.Description>
        Update category details and settings
      </Drawer.Description>
    </Drawer.Header>

    {#if category}
      <div class="space-y-4 px-4">
        <Field>
          <FieldContent>
            <FieldLabel for="name">Name *</FieldLabel>
            <Input
              id="name"
              bind:value={name}
              placeholder="Category name"
              required
              aria-invalid={errors.name ? "true" : undefined}
            />
          </FieldContent>
          {#if errors.name}
            <FieldError errors={[{ message: errors.name }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="slug">Slug *</FieldLabel>
            <Input
              id="slug"
              bind:value={slug}
              placeholder="category-slug"
              required
              aria-invalid={errors.slug ? "true" : undefined}
            />
            <p class="text-xs text-muted-foreground mt-1">
              URL-friendly identifier
            </p>
          </FieldContent>
          {#if errors.slug}
            <FieldError errors={[{ message: errors.slug }]} />
          {/if}
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel for="description">Description</FieldLabel>
            <textarea
              id="description"
              bind:value={description}
              placeholder="Category description..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FieldContent>
        </Field>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldContent>
              <FieldLabel for="icon">Icon (Emoji/Text)</FieldLabel>
              <Input
                id="icon"
                bind:value={icon}
                placeholder="🔧 or icon name"
                maxlength="2"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel for="color">Color</FieldLabel>
              <div class="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  bind:value={color}
                  class="h-9 w-20"
                />
                <Input
                  type="text"
                  bind:value={color}
                  placeholder="#000000"
                  class="flex-1"
                />
              </div>
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldContent>
            <FieldLabel for="parent">Parent Category (Optional)</FieldLabel>
            <Select.Root bind:selected={parentId} onSelectedChange={(v) => {
              parentId = v?.value || "";
            }}>
              <Select.Trigger>
                <Select.Value placeholder="No parent category" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">No parent category</Select.Item>
                {#each categories.filter((c) => c.id !== category.id) as cat}
                  <Select.Item value={cat.id}>{cat.name}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </FieldContent>
        </Field>

        <div class="flex items-center justify-between rounded-lg border p-3">
          <div class="space-y-0.5">
            <FieldLabel>Active</FieldLabel>
            <p class="text-sm text-muted-foreground">
              Show this category in the category list
            </p>
          </div>
          <Checkbox.Root bind:checked={isActive} />
        </div>

        {#if errors.submit}
          <div class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {errors.submit}
          </div>
        {/if}
      </div>
    {/if}

    <Drawer.Footer class="flex-row justify-between">
      <Button
        variant="destructive"
        onclick={handleDelete}
        disabled={isDeleting || isSubmitting}
      >
        <IconTrash class="size-4" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
      <div class="flex gap-2">
        <Button variant="outline" onclick={handleCancel} disabled={isSubmitting || isDeleting}>
          Cancel
        </Button>
        <Button onclick={handleUpdate} disabled={isSubmitting || isDeleting || !category}>
          {isSubmitting ? "Updating..." : "Update Category"}
        </Button>
      </div>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

