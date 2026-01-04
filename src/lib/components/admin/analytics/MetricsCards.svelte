<script lang="ts">
  import StatCard from "$lib/components/admin/shared/StatCard.svelte";
  import { IconCurrencyDollar, IconGavel, IconTrendingUp, IconTarget } from "@tabler/icons-svelte";
  import { formatCurrency } from "$lib/utils";

  interface Metrics {
    total_revenue: number;
    revenue_change?: number;
    total_bids: number;
    bids_change?: number;
    average_sale_price: number;
    avg_price_change?: number;
    conversion_rate: number;
    conversion_change?: number;
  }

  interface Props {
    metrics: Metrics;
    loading?: boolean;
  }

  let { metrics, loading = false }: Props = $props();

  let revenueTrend = $derived(
    metrics.revenue_change !== undefined
      ? metrics.revenue_change >= 0
        ? "up"
        : "down"
      : undefined
  );

  let bidsTrend = $derived(
    metrics.bids_change !== undefined
      ? metrics.bids_change >= 0
        ? "up"
        : "down"
      : undefined
  );

  let avgPriceTrend = $derived(
    metrics.avg_price_change !== undefined
      ? metrics.avg_price_change >= 0
        ? "up"
        : "down"
      : undefined
  );

  let conversionTrend = $derived(
    metrics.conversion_change !== undefined
      ? metrics.conversion_change >= 0
        ? "up"
        : "down"
      : undefined
  );
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard
    title="Total Revenue"
    value={formatCurrency(metrics.total_revenue)}
    icon={IconCurrencyDollar}
    change={metrics.revenue_change !== undefined ? Math.abs(metrics.revenue_change) : undefined}
    trend={revenueTrend}
    {loading}
  />
  <StatCard
    title="Total Bids"
    value={metrics.total_bids.toLocaleString()}
    icon={IconGavel}
    change={metrics.bids_change !== undefined ? Math.abs(metrics.bids_change) : undefined}
    trend={bidsTrend}
    {loading}
  />
  <StatCard
    title="Average Sale Price"
    value={formatCurrency(metrics.average_sale_price)}
    icon={IconTrendingUp}
    change={metrics.avg_price_change !== undefined ? Math.abs(metrics.avg_price_change) : undefined}
    trend={avgPriceTrend}
    {loading}
  />
  <StatCard
    title="Conversion Rate"
    value={`${metrics.conversion_rate.toFixed(1)}%`}
    icon={IconTarget}
    change={metrics.conversion_change !== undefined ? Math.abs(metrics.conversion_change) : undefined}
    trend={conversionTrend}
    {loading}
  />
</div>

