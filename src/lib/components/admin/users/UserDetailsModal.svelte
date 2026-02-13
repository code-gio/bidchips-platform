<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import type { User } from "$lib/types/user";
  import { IconBan, IconShield } from "@tabler/icons-svelte";
  import { formatCurrency, formatDate } from "$lib/utils";

  interface Props {
    open?: boolean;
    user: User | null;
    onBan?: () => void;
    onChangeRole?: () => void;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    user,
    onBan,
    onChangeRole,
    onCancel,
  }: Props = $props();

  function getUserDisplayName(user: User): string {
    if (user.display_name) return user.display_name;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.email;
  }

  function getUserInitials(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.display_name) {
      return user.display_name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  }

  function getFullAddress(user: User): string {
    const parts = [
      user.address_street,
      user.address_city,
      user.address_state,
      user.address_zip,
      user.country,
    ].filter(Boolean);
    return parts.join(", ") || "No address on file";
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="flex h-full max-h-full flex-col sm:max-w-2xl"
  >
    <Sheet.Header>
      <Sheet.Title>User Details</Sheet.Title>
      <Sheet.Description>
        View and manage user information
      </Sheet.Description>
    </Sheet.Header>

    {#if user}
      <div class="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        <!-- User Info Card -->
        <Card.Root>
          <Card.Content class="pt-6">
            <div class="flex items-start gap-4">
              <Avatar.Root class="size-16">
                <Avatar.Image src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                <Avatar.Fallback class="text-lg">{getUserInitials(user)}</Avatar.Fallback>
              </Avatar.Root>
              <div class="flex-1 space-y-2">
                <div>
                  <h3 class="text-lg font-semibold">{getUserDisplayName(user)}</h3>
                  <p class="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div class="flex gap-2">
                  {#if user.role === "admin"}
                    <Badge variant="default" class="gap-1">
                      <IconShield class="size-3" />
                      Admin
                    </Badge>
                  {:else}
                    <Badge variant="secondary">User</Badge>
                  {/if}
                  {#if user.is_banned}
                    <Badge variant="destructive">Banned</Badge>
                  {:else if user.is_active}
                    <Badge variant="default">Active</Badge>
                  {:else}
                    <Badge variant="secondary">Inactive</Badge>
                  {/if}
                </div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Contact Information -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Contact Information</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            {#if user.company}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Company</p>
                <p class="text-sm">{user.company}</p>
              </div>
            {/if}
            {#if user.phone}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Phone</p>
                <p class="text-sm">{user.phone}</p>
              </div>
            {/if}
            <div>
              <p class="text-sm font-medium text-muted-foreground">Address</p>
              <p class="text-sm">{getFullAddress(user)}</p>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Statistics -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Statistics</Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Bids</p>
                <p class="text-2xl font-bold">{user.total_bids}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Wins</p>
                <p class="text-2xl font-bold">{user.total_wins}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p class="text-2xl font-bold">{formatCurrency(user.total_spent)}</p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Account Information -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Account Information</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Member Since</p>
              <p class="text-sm">{formatDate(user.created_at)}</p>
            </div>
            {#if user.last_login_at}
              <div>
                <p class="text-sm font-medium text-muted-foreground">Last Login</p>
                <p class="text-sm">{formatDate(user.last_login_at)}</p>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>

        <!-- Actions -->
        <div class="flex gap-2">
          {#if !user.is_banned}
            <Button variant="destructive" onclick={onBan}>
              <IconBan class="size-4" />
              Ban User
            </Button>
          {/if}
          <!-- <Button variant="outline" onclick={onChangeRole}>
            <IconShield class="size-4" />
            Change Role
          </Button> -->
        </div>
      </div>
    {/if}

    <Sheet.Footer class="flex-row justify-end border-t">
      <Button variant="outline" onclick={() => {
        open = false;
        onCancel?.();
      }}>
        Close
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

