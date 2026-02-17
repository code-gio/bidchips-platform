<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import UserSidebar from "$lib/components/nav/user/user-sidebar.svelte";
  import UserSiteHeader from "$lib/components/nav/user/user-site-header.svelte";

  let { children } = $props();
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
  <UserSidebar variant="inset" />
  <Sidebar.Inset>
    <UserSiteHeader />
    <div class="flex flex-1 flex-col px-5 md:px-10 lg:px-12 xl:px-14">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {@render children()}
        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
