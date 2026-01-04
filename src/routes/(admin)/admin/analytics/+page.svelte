<script lang="ts">
  import { onMount } from "svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import MetricsCards from "$lib/components/admin/analytics/MetricsCards.svelte";
  import RevenueChart from "$lib/components/admin/analytics/RevenueChart.svelte";
  import TopLotsTable from "$lib/components/admin/analytics/TopLotsTable.svelte";
  import { IconChartBar } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  type DateRange = "7d" | "30d" | "90d" | "custom";

  interface AnalyticsData {
    metrics: {
      total_revenue: number;
      revenue_change?: number;
      total_bids: number;
      bids_change?: number;
      average_sale_price: number;
      avg_price_change?: number;
      conversion_rate: number;
      conversion_change?: number;
    };
    revenue_data: Array<{ date: string; revenue: number }>;
    top_lots: Array<{
      id: string;
      title: string;
      thumbnail_url: string | null;
      final_price: number;
      bid_count: number;
      winner_name: string | null;
      winner_email: string | null;
    }>;
  }

  let dateRange = $state<DateRange>("30d");
  let isLoading = $state(true);
  let analyticsData = $state<AnalyticsData | null>(null);

  onMount(async () => {
    await fetchAnalytics();
    isLoading = false;
  });

  async function fetchAnalytics() {
    isLoading = true;
    try {
      const params = new URLSearchParams({ range: dateRange });
      const res = await fetch(`/api/admin/analytics/overview?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          analyticsData = data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchAnalytics();
  });
</script>

<div class="space-y-6 px-4 lg:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Analytics Overview</h1>
      <p class="text-muted-foreground mt-2">
        Track performance metrics and revenue trends
      </p>
    </div>
    <Select.Root bind:selected={dateRange} onSelectedChange={(v) => {
      dateRange = (v?.value as DateRange) || "30d";
    }}>
      <Select.Trigger class="w-[180px]">
        <Select.Value placeholder="Select range" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="7d">Last 7 days</Select.Item>
        <Select.Item value="30d">Last 30 days</Select.Item>
        <Select.Item value="90d">Last 90 days</Select.Item>
        <Select.Item value="custom">Custom range</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  {#if isLoading && !analyticsData}
    <div class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {#each Array(4) as _}
          <div class="h-32 animate-pulse rounded-lg bg-muted"></div>
        {/each}
      </div>
      <div class="h-[300px] animate-pulse rounded-lg bg-muted"></div>
      <div class="h-[400px] animate-pulse rounded-lg bg-muted"></div>
    </div>
  {:else if analyticsData}
    <div class="space-y-6">
      <!-- Metrics Cards -->
      <MetricsCards metrics={analyticsData.metrics} loading={isLoading} />

      <!-- Revenue Chart -->
      <RevenueChart data={analyticsData.revenue_data} loading={isLoading} />

      <!-- Top Lots Table -->
      <TopLotsTable lots={analyticsData.top_lots} loading={isLoading} />
    </div>
  {:else}
    <div class="flex h-[400px] flex-col items-center justify-center rounded-lg border">
      <IconChartBar class="size-12 text-muted-foreground mb-4" />
      <p class="text-lg font-medium">No Analytics Data</p>
      <p class="text-sm text-muted-foreground">Analytics data will appear here once sales are recorded.</p>
    </div>
  {/if}
</div>
