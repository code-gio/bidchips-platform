<script lang="ts">
  import { onMount } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import UsersTable from "$lib/components/admin/users/UsersTable.svelte";
  import UserDetailsModal from "$lib/components/admin/users/UserDetailsModal.svelte";
  import BanUserModal from "$lib/components/admin/users/BanUserModal.svelte";
  import ConfirmDialog from "$lib/components/admin/shared/ConfirmDialog.svelte";
  import type { User } from "$lib/types/user";
  import { IconSearch, IconUsers, IconUserX } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  let users = $state<User[]>([]);
  let filteredUsers = $state<User[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let activeTab = $state("all");
  let showUserDetails = $state(false);
  let showBanModal = $state(false);
  let showUnbanDialog = $state(false);
  let selectedUser = $state<User | null>(null);
  let userToUnban = $state<User | null>(null);

  let { data } = $props();



  const currentUser = $derived(data.profile);

  onMount(async () => {
    console.log("fetching users");
    await fetchUsers();
    isLoading = false;
  });

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        if (data.success) {
          // Handle both { data: [...] } and { data: { data: [...] } } formats
          users = Array.isArray(data.data) ? data.data : (data.data?.data || []);
          applyFilters();
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  }

  function applyFilters() {
    let filtered = [...users];

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((u) => u.is_active && !u.is_banned && u.total_bids > 0);
    } else if (activeTab === "banned") {
      filtered = filtered.filter((u) => u.is_banned);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          (u.first_name && u.first_name.toLowerCase().includes(query)) ||
          (u.last_name && u.last_name.toLowerCase().includes(query)) ||
          (u.display_name && u.display_name.toLowerCase().includes(query)) ||
          (u.company && u.company.toLowerCase().includes(query))
      );
    }

    filteredUsers = filtered;
  }

  $effect(() => {
    applyFilters();
  });

  async function handleBan(reason: string) {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("User banned successfully");
          await fetchUsers();
          showBanModal = false;
          selectedUser = null;
        } else {
          throw new Error(result.error || "Failed to ban user");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to ban user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
      throw error;
    }
  }

  async function handleUnban() {
    if (!userToUnban) return;
    try {
      const res = await fetch(`/api/admin/users/${userToUnban.id}/unban`, {
        method: "PUT",
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success("User unbanned successfully");
          await fetchUsers();
          showUnbanDialog = false;
          userToUnban = null;
        } else {
          throw new Error(result.error || "Failed to unban user");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to unban user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
    }
  }

  async function handleChangeRole(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(`User role changed to ${newRole}`);
          await fetchUsers();
        } else {
          throw new Error(result.error || "Failed to change role");
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to change role");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change role");
    }
  }

  function handleView(user: User) {
    selectedUser = user;
    showUserDetails = true;
  }

  function handleBanClick(user: User) {
    selectedUser = user;
    showBanModal = true;
  }

  function handleUnbanClick(user: User) {
    userToUnban = user;
    showUnbanDialog = true;
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Users</h1>
      <p class="text-muted-foreground mt-2">
        Manage user accounts, roles, and permissions
      </p>
    </div>
  </div>

  <div class="space-y-4">
    <!-- Search and Filters -->
    <div class="flex gap-4">
      <div class="relative flex-1">
        <IconSearch class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or company..."
          bind:value={searchQuery}
          class="pl-9"
        />
      </div>
    </div>

    <!-- Tabs -->
    <Tabs.Root bind:value={activeTab} class="w-full">
      <Tabs.List>
        <Tabs.Trigger value="all">All Users</Tabs.Trigger>
        <Tabs.Trigger value="active">Active Bidders</Tabs.Trigger>
        <Tabs.Trigger value="banned">Banned</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <!-- Users Table -->
    {#if isLoading}
      <div class="space-y-2">
        {#each Array(5) as _}
          <div class="h-16 animate-pulse rounded bg-muted"></div>
        {/each}
      </div>
    {:else if filteredUsers.length === 0}
      <Empty.Root>
        <Empty.Header>
          <Empty.Media variant="icon">
            {#if activeTab === "banned"}
              <IconUserX />
            {:else}
              <IconUsers />
            {/if}
          </Empty.Media>
          <Empty.Title>No Users Found</Empty.Title>
          <Empty.Description>
            {#if searchQuery}
              No users match your search criteria.
            {:else if activeTab === "banned"}
              No banned users found.
            {:else if activeTab === "active"}
              No active bidders found.
            {:else}
              No users found in the system.
            {/if}
          </Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <UsersTable
        users={filteredUsers}
        onView={handleView}
        onBan={handleBanClick}
        onUnban={handleUnbanClick}
        onChangeRole={handleChangeRole}
        currentUser={currentUser}
      />
    {/if}
  </div>
</div>

<!-- User Details Modal -->
<UserDetailsModal
  bind:open={showUserDetails}
  user={selectedUser}
  onBan={() => {
    showUserDetails = false;
    if (selectedUser) {
      showBanModal = true;
    }
  }}
  onChangeRole={() => {
    if (selectedUser) {
      handleChangeRole(selectedUser);
    }
  }}
/>

<!-- Ban Modal -->
<BanUserModal
  bind:open={showBanModal}
  user={selectedUser}
  onConfirm={handleBan}
  onCancel={() => {
    selectedUser = null;
    showBanModal = false;
  }}
/>

<!-- Unban Confirmation -->
<ConfirmDialog
  bind:open={showUnbanDialog}
  title="Unban User"
  description="Are you sure you want to unban '{userToUnban?.display_name || userToUnban?.email}'? They will be able to access the platform again."
  confirmText="Unban"
  onConfirm={handleUnban}
/>
