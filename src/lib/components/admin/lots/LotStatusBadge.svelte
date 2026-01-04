<script lang="ts">
  import * as Badge from "$lib/components/ui/badge/index.js";
  import type { Lot } from "$lib/types/lot";

  type LotStatus = Lot["status"];

  let { status }: { status: LotStatus } = $props();

  const statusConfig: Record<
    LotStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    draft: { label: "Draft", variant: "secondary" },
    scheduled: { label: "Scheduled", variant: "outline" },
    active: { label: "Active", variant: "default" },
    sold: { label: "Sold", variant: "default" },
    unsold: { label: "Unsold", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  let config = $derived(statusConfig[status] || statusConfig.draft);
</script>

<Badge.Root variant={config.variant} class="capitalize">
  {config.label}
</Badge.Root>

