<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import StatCard from "$lib/components/admin/shared/StatCard.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Badge from "$lib/components/ui/badge/index.js";
  import { IconUsers, IconHammer, IconGavel, IconMoneybag, IconActivity, IconClock } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import type { User } from "$lib/types/user";
  import * as Empty from "$lib/components/ui/empty/index.js";

  interface DashboardStats {
    total_users: number;
    active_lots: number;
    total_bids_today?: number;
    total_revenue_30d: number;
    active_users_30d?: number;
  }

  interface ActivityLog {
    id: string;
    user_name: string | null;
    action: string;
    resource: string;
    resource_id: string | null;
    created_at: string;
  }

  interface ActiveLot {
    id: string;
    title: string;
    current_price: number;
    bid_count: number;
    end_time: string;
  }

  interface PendingOffer {
    id: string;
    user_name: string;
    lot_title: string;
    amount: number;
    created_at: string;
  }

  let stats = $state<DashboardStats | null>(null);
  let recentActivity = $state<ActivityLog[]>([]);
  let activeAuctions = $state<ActiveLot[]>([]);
  let pendingOffers = $state<PendingOffer[]>([]);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      // Fetch dashboard stats
      const statsRes = await fetch("/api/admin/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          stats = statsData.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }

    try {
      // Fetch recent activity
      const activityRes = await fetch("/api/admin/activity-log?limit=10");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        if (activityData.success) {
          recentActivity = activityData.data?.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }

    try {
      // Fetch active auctions
      const lotsRes = await fetch("/api/admin/lots?status=active&limit=5");
      if (lotsRes.ok) {
        const lotsData = await lotsRes.json();
        if (lotsData.success) {
          activeAuctions = lotsData.data?.data || [];
        }
      }
    } catch (error) {
      console.error("Failed to fetch active auctions:", error);
    }

    try {
      // Fetch pending offers
      const offersRes = await fetch("/api/admin/offers/pending");
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        if (offersData.success) {
          pendingOffers = (offersData.data || []).slice(0, 5);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pending offers:", error);
    }

    isLoading = false;
  });

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTimeRemaining(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
    <p class="text-muted-foreground mt-2">
      Overview of your auction platform
    </p>
  </div>

  <!-- Stats Grid -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="Total Users"
      value={stats?.total_users?.toLocaleString() || "0"}
      icon={IconUsers}
      change={stats?.users_change_30d}
      trend={stats?.users_change_30d && stats.users_change_30d > 0 ? "up" : "down"}
      loading={isLoading}
    />
    <StatCard
      title="Active Lots"
      value={stats?.active_lots?.toLocaleString() || "0"}
      icon={IconHammer}
      loading={isLoading}
    />
    <StatCard
      title="Active Users (30d)"
      value={stats?.active_users_30d?.toLocaleString() || "0"}
      icon={IconUsers}
      loading={isLoading}
    />
    <StatCard
      title="Revenue (30d)"
      value={stats?.total_revenue_30d ? formatCurrency(stats.total_revenue_30d) : "$0"}
      icon={IconMoneybag}
      loading={isLoading}
    />
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <!-- Recent Activity -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
        <Card.Description>Last 10 activities on the platform</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if isLoading}
          <div class="space-y-2">
            {#each Array(5) as _}
              <div class="h-12 animate-pulse rounded bg-muted"></div>
            {/each}
          </div>
        {:else if recentActivity.length === 0}
          <Empty.Root>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconActivity />
              </Empty.Media>
              <Empty.Title>No Recent Activity</Empty.Title>
              <Empty.Description>
                There hasn't been any activity on the platform recently.
              </Empty.Description>
            </Empty.Header>
          </Empty.Root>
        {:else}
          <Table.Root>
            <Table.Body>
              {#each recentActivity as activity}
                <Table.Row>
                  <Table.Cell class="font-medium">{activity.user_name || "System"}</Table.Cell>
                  <Table.Cell>
                    <Badge.Root variant="outline">{activity.action}</Badge.Root>
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground text-xs">
                    {formatDate(activity.created_at)}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
          <div class="mt-4">
            <Button variant="outline" href="/admin/activity-log" class="w-full">
              View All Activity
            </Button>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Active Auctions -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Active Auctions</Card.Title>
        <Card.Description>Lots ending soonest</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if isLoading}
          <div class="space-y-2">
            {#each Array(5) as _}
              <div class="h-12 animate-pulse rounded bg-muted"></div>
            {/each}
          </div>
        {:else if activeAuctions.length === 0}
          <Empty.Root>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconHammer />
              </Empty.Media>
              <Empty.Title>No Active Auctions</Empty.Title>
              <Empty.Description>
                There are currently no active auctions. Create a new lot to get started.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button variant="outline" href="/admin/lots/new">
                Create New Lot
              </Button>
            </Empty.Content>
          </Empty.Root>
        {:else}
          <Table.Root>
            <Table.Body>
              {#each activeAuctions as lot}
                <Table.Row>
                  <Table.Cell class="font-medium max-w-[200px] truncate">
                    {lot.title}
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(lot.current_price)}</Table.Cell>
                  <Table.Cell>{lot.bid_count} bids</Table.Cell>
                  <Table.Cell class="text-muted-foreground text-xs">
                    {formatTimeRemaining(lot.end_time)}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
          <div class="mt-4">
            <Button variant="outline" href="/admin/lots/active" class="w-full">
              View All Active Lots
            </Button>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Pending Offers -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Pending Offers</Card.Title>
      <Card.Description>Offers awaiting admin response</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if isLoading}
        <div class="space-y-2">
          {#each Array(5) as _}
            <div class="h-12 animate-pulse rounded bg-muted"></div>
          {/each}
        </div>
      {:else if pendingOffers.length === 0}
        <Empty.Root>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconMoneybag />
            </Empty.Media>
            <Empty.Title>No Pending Offers</Empty.Title>
            <Empty.Description>
              All offers have been reviewed. New offers will appear here when submitted.
            </Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>User</Table.Head>
              <Table.Head>Lot</Table.Head>
              <Table.Head>Amount</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head class="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each pendingOffers as offer}
              <Table.Row>
                <Table.Cell class="font-medium">{offer.user_name}</Table.Cell>
                <Table.Cell class="max-w-[200px] truncate">{offer.lot_title}</Table.Cell>
                <Table.Cell>{formatCurrency(offer.amount)}</Table.Cell>
                <Table.Cell class="text-muted-foreground text-xs">
                  {formatDate(offer.created_at)}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    href="/admin/offers/pending"
                  >
                    Review
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
        <div class="mt-4">
          <Button variant="outline" href="/admin/offers/pending" class="w-full">
            View All Pending Offers
          </Button>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>

