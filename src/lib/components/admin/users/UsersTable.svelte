<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { User } from "$lib/types/user";
  import { IconDotsVertical, IconUser, IconBan, IconShield, IconEye } from "@tabler/icons-svelte";
  import { formatCurrency } from "$lib/utils";

  interface Props {
    users: User[];
    onView?: (user: User) => void;
    onBan?: (user: User) => void;
    onUnban?: (user: User) => void;
    onChangeRole?: (user: User) => void;
  }

  let {
    users,
    onView,
    onBan,
    onUnban,
    onChangeRole,
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
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>User</Table.Head>
      <Table.Head>Email</Table.Head>
      <Table.Head class="text-right">Total Bids</Table.Head>
      <Table.Head class="text-right">Total Wins</Table.Head>
      <Table.Head>Role</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head class="w-12"></Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#if users.length === 0}
      <Table.Row>
        <Table.Cell colspan="7" class="h-24 text-center text-muted-foreground">
          No users found
        </Table.Cell>
      </Table.Row>
    {:else}
      {#each users as user}
        <Table.Row>
          <Table.Cell>
            <div class="flex items-center gap-3">
              <Avatar.Root>
                <Avatar.Image src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                <Avatar.Fallback>{getUserInitials(user)}</Avatar.Fallback>
              </Avatar.Root>
              <div>
                <div class="font-medium">{getUserDisplayName(user)}</div>
                {#if user.company}
                  <div class="text-xs text-muted-foreground">{user.company}</div>
                {/if}
              </div>
            </div>
          </Table.Cell>
          <Table.Cell class="text-sm text-muted-foreground">{user.email}</Table.Cell>
          <Table.Cell class="text-right">
            <div class="font-medium">{user.total_bids}</div>
            <div class="text-xs text-muted-foreground">
              {formatCurrency(user.total_spent)}
            </div>
          </Table.Cell>
          <Table.Cell class="text-right font-medium">{user.total_wins}</Table.Cell>
          <Table.Cell>
            {#if user.role === "admin"}
              <Badge.Root variant="default" class="gap-1">
                <IconShield class="size-3" />
                Admin
              </Badge.Root>
            {:else}
              <Badge.Root variant="secondary">User</Badge.Root>
            {/if}
          </Table.Cell>
          <Table.Cell>
            {#if user.is_banned}
              <Badge.Root variant="destructive">Banned</Badge.Root>
            {:else if user.is_active}
              <Badge.Root variant="default">Active</Badge.Root>
            {:else}
              <Badge.Root variant="secondary">Inactive</Badge.Root>
            {/if}
          </Table.Cell>
          <Table.Cell>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild let:builder>
                <Button variant="ghost" size="icon" builders={[builder]}>
                  <IconDotsVertical class="size-4" />
                  <span class="sr-only">Actions</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onclick={() => onView?.(user)}>
                  <IconEye class="size-4" />
                  View Profile
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                {#if user.is_banned}
                  <DropdownMenu.Item onclick={() => onUnban?.(user)}>
                    <IconUser class="size-4" />
                    Unban User
                  </DropdownMenu.Item>
                {:else}
                  <DropdownMenu.Item onclick={() => onBan?.(user)}>
                    <IconBan class="size-4" />
                    Ban User
                  </DropdownMenu.Item>
                {/if}
                <DropdownMenu.Item onclick={() => onChangeRole?.(user)}>
                  <IconShield class="size-4" />
                  Change Role
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>

