<script lang="ts">
  import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
  import UserNavMain from "./user-nav-main.svelte";
  import NavSecondary from "$lib/components/shared/nav-secondary.svelte";
  import NavUser from "$lib/components/shared/nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import { siteConfig } from "$lib/config";

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          {#snippet child({ props })}
            <a href="/dashboard" {...props}>
              <InnerShadowTopIcon class="!size-5" />
              <span class="text-base font-semibold">{siteConfig.title}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <UserNavMain />
    <NavSecondary class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
</Sidebar.Root>
