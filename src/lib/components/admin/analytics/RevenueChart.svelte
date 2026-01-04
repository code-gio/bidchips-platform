<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { ChartContainer, ChartTooltip, type ChartConfig } from "$lib/components/ui/chart/index.js";
  import { Area, AreaChart } from "layerchart";
  import { formatCurrency } from "$lib/utils";

  interface DataPoint {
    date: string;
    revenue: number;
  }

  interface Props {
    data: DataPoint[];
    loading?: boolean;
  }

  let { data, loading = false }: Props = $props();

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Revenue Over Time</Card.Title>
    <Card.Description>Daily revenue for the selected period</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if loading}
      <div class="flex h-[300px] items-center justify-center">
        <div class="text-muted-foreground">Loading chart data...</div>
      </div>
    {:else if data.length === 0}
      <div class="flex h-[300px] items-center justify-center">
        <div class="text-muted-foreground">No data available</div>
      </div>
    {:else}
      <ChartContainer config={chartConfig} class="h-[300px] w-full">
        <AreaChart data={data}>
          <ChartTooltip />
          <Area
            data={data}
            x={(d) => d.date}
            y1={(d) => d.revenue}
            fill="var(--color-revenue)"
            fillOpacity={0.2}
            stroke="var(--color-revenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    {/if}
  </Card.Content>
</Card.Root>

