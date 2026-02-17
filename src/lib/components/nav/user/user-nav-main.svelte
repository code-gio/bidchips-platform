<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { navMain } from "$lib/config";
</script>

<Sidebar.Group>
  <Sidebar.GroupContent class="flex flex-col gap-2">
    <Sidebar.Menu>
      {#each navMain as item (item.title)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={item.title}>
            {#snippet child({ props })}
              <a href={item.url} {...props}>
                {#if item.icon}
                  <item.icon />
                {/if}
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
