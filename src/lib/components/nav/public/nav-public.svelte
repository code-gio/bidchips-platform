<script lang="ts">
	import { navPublic, siteConfig } from "$lib/config";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
	import { cn } from "$lib/utils.js";

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<nav
	class="border-b border-border z-10 w-full bg-background lg:fixed py-4 "
	id="topnav"
>
	<div class="mx-auto max-w-7xl">
		<div class="w-full flex flex-col lg:flex-row gap-2">
			<!-- Mobile header -->
			<div class="flex justify-between lg:hidden gap-2">
				<a href="/" class="flex items-center">
					<img
						src={siteConfig.logo}
						alt={siteConfig.title}
						class="h-8 dark:hidden"
					/>
					<img
						src={siteConfig.logoDark}
						alt={siteConfig.title}
						class="hidden h-8 dark:block"
					/>
				</a>
				<button
					type="button"
					class="inline-flex items-center text-sm text-muted-foreground rounded-lg lg:hidden hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
					aria-controls="navbar-default"
					aria-expanded={mobileMenuOpen}
					onclick={toggleMobileMenu}
				>
					<span class="sr-only">Open main menu</span>
					<svg
						class="w-6 h-6"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
							clip-rule="evenodd"
						></path>
					</svg>
				</button>
			</div>

			<!-- Navigation menu -->
			<div
				class={cn(
					"w-full lg:flex max-lg:bg-popover max-lg:mt-1 max-lg:shadow-lg max-lg:h-auto max-lg:overflow-auto transition-all duration-500 delay-200 gap-2",
					mobileMenuOpen ? "block" : "hidden"
				)}
				id="navbar"
			>
				<!-- Desktop logo (left) -->
				<a href="/" class="hidden lg:flex items-center">
					<img
						src={siteConfig.logo}
						alt={siteConfig.title}
						class="h-8 dark:hidden"
					/>
					<img
						src={siteConfig.logoDark}
						alt={siteConfig.title}
						class="hidden h-8 dark:block"
					/>
				</a>

				<NavigationMenu.Root viewport={false} class="flex-1">
					<NavigationMenu.List class="flex lg:items-center flex-col lg:flex-1 lg:flex-row gap-2">
						{#each navPublic as item}
							<NavigationMenu.Item>
								{#if item.items && item.items.length > 0}
									<NavigationMenu.Trigger class="text-muted-foreground hover:text-foreground transition-all duration-500">
										{item.title}
									</NavigationMenu.Trigger>
									<NavigationMenu.Content class="animate-fade z-10 relative lg:absolute top-2 lg:top-14 lg:-left-20 bg-popover rounded-lg shadow-lg border border-border lg:min-w-[800px] md:min-w-[500px] min-w-full">
										<div class="flex flex-col sm:flex-row lg:justify-between gap-2">
											<ul class="text-popover-foreground lg:w-1/2 gap-2 flex flex-col">
												{#each item.items as subItem}
													<li>
														<NavigationMenu.Link
															href={subItem.url}
															class="transition-all duration-500 hover:bg-accent hover:rounded-xl flex items-center"
														>
															<div>
																<h5 class="text-foreground">
																	{subItem.title}
																</h5>
															</div>
														</NavigationMenu.Link>
													</li>
												{/each}
											</ul>
										</div>
									</NavigationMenu.Content>
								{:else}
									<NavigationMenu.Link
										href={item.url}
										class="text-muted-foreground hover:text-foreground transition-all duration-500"
									>
										{item.title}
									</NavigationMenu.Link>
								{/if}
							</NavigationMenu.Item>
						{/each}
					</NavigationMenu.List>
				</NavigationMenu.Root>

				<!-- Auth buttons -->
				<div
					class="flex lg:items-center justify-start flex-col lg:flex-row lg:flex-1 lg:justify-end gap-2"
				>
					<Button
						variant="outline"
						href="/sign-in"
						class="rounded-full"
					>
						Login
					</Button>
					<Button
						href="/sign-up"
						class="rounded-full"
					>
						Sign up
					</Button>
				</div>
			</div>
		</div>
	</div>
</nav>

