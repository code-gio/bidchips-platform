<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User } from "$lib/types/user.js";
  import { formatDate } from "$lib/utils.js";

  let { user }: { user: User } = $props();

  const displayName = $derived(
    user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      user.email
  );
</script>

<Table.Root>
  <Table.Body>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground w-[220px]">Email</Table.Cell>
      <Table.Cell>
        <a href="mailto:{user.email}" class="text-primary hover:underline">
          {user.email}
        </a>
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Display name</Table.Cell>
      <Table.Cell>{user.display_name || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">First name</Table.Cell>
      <Table.Cell>{user.first_name || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Last name</Table.Cell>
      <Table.Cell>{user.last_name || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Username</Table.Cell>
      <Table.Cell>{user.username || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Company</Table.Cell>
      <Table.Cell>{user.company || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Phone</Table.Cell>
      <Table.Cell>{user.phone || "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Role</Table.Cell>
      <Table.Cell>
        {#if user.role === "admin"}
          <Badge variant="default">Admin</Badge>
        {:else}
          <Badge variant="secondary">User</Badge>
        {/if}
      </Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Onboarding completed</Table.Cell>
      <Table.Cell>{user.onboarding_completed ? "Yes" : "No"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Created at</Table.Cell>
      <Table.Cell>{formatDate(user.created_at)}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Updated at</Table.Cell>
      <Table.Cell>{user.updated_at ? formatDate(user.updated_at) : "—"}</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell class="font-medium text-muted-foreground">Last login at</Table.Cell>
      <Table.Cell>{user.last_login_at ? formatDate(user.last_login_at) : "—"}</Table.Cell>
    </Table.Row>
    {#if user.tagline}
      <Table.Row>
        <Table.Cell class="font-medium text-muted-foreground">Tagline</Table.Cell>
        <Table.Cell>{user.tagline}</Table.Cell>
      </Table.Row>
    {/if}
    {#if user.bio}
      <Table.Row>
        <Table.Cell class="font-medium text-muted-foreground">Bio</Table.Cell>
        <Table.Cell class="whitespace-pre-wrap max-w-md">{user.bio}</Table.Cell>
      </Table.Row>
    {/if}
  </Table.Body>
</Table.Root>
