<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User } from "$lib/types/user.js";
  import { formatCurrency, formatDate } from "$lib/utils.js";
  import { timeAgo } from "$lib/utils.js";

  let { user }: { user: User } = $props();

  const displayName = $derived(
    user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      user.email
  );

  const statusLabel = $derived(
    user.is_banned ? "Banned" : user.is_active ? "Active" : "Inactive"
  );

  const primaryAddress = $derived(
    [
      user.address_street,
      user.address_city,
      user.address_state,
      user.address_zip,
      user.country,
    ]
      .filter(Boolean)
      .join(", ") || "—"
  );

  const lastLoginAt = $derived(user.last_login_at ?? null);
  const lastLoginAgo = $derived(
    lastLoginAt ? timeAgo(new Date(lastLoginAt)) : null
  );
</script>

<Table.Root>
  <Table.Body>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground w-[220px]">ID</Table.Cell>
      <Table.Cell class="font-mono text-sm">{user.id}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Username</Table.Cell>
      <Table.Cell>{user.username || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Status</Table.Cell>
      <Table.Cell>
        {#if user.is_banned}
          <Badge variant="destructive">{statusLabel}</Badge>
        {:else if user.is_active}
          <Badge variant="default">{statusLabel}</Badge>
        {:else}
          <Badge variant="secondary">{statusLabel}</Badge>
        {/if}
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Email</Table.Cell>
      <Table.Cell>
        <a
          href="mailto:{user.email}"
          class="text-primary hover:underline"
        >
          {user.email}
        </a>
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Name</Table.Cell>
      <Table.Cell>{displayName}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Primary Address</Table.Cell>
      <Table.Cell class="text-sm">{primaryAddress}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Last signed in</Table.Cell>
      <Table.Cell>
        {#if lastLoginAt}
          {formatDate(lastLoginAt)}
          {#if lastLoginAgo}
            <span class="text-muted-foreground text-sm">({lastLoginAgo})</span>
          {/if}
        {:else}
          —
        {/if}
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Last active on</Table.Cell>
      <Table.Cell>
        {#if lastLoginAt}
          {formatDate(lastLoginAt)}
          {#if lastLoginAgo}
            <span class="text-muted-foreground text-sm">({lastLoginAgo})</span>
          {/if}
        {:else}
          —
        {/if}
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Account created on</Table.Cell>
      <Table.Cell>{formatDate(user.created_at)}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Time zone</Table.Cell>
      <Table.Cell>{user.time_zone || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Language</Table.Cell>
      <Table.Cell>{user.language || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Total Bids</Table.Cell>
      <Table.Cell>{user.total_bids}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Wins</Table.Cell>
      <Table.Cell>{user.total_wins}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Total Spent</Table.Cell>
      <Table.Cell>{formatCurrency(user.total_spent)}</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
