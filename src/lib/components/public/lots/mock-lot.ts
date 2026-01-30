import type { Lot } from "$lib/types/lot";

/**
 * Returns a mock Lot for design-only pages. Pass id to customize (e.g. from route param).
 */
export function createMockLot(id: string = "mock-lot-1"): Lot {
	const now = new Date();
	const endTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
	return {
		id,
		title: "STM32F407VGT6 Microcontroller - Lot of 10 units",
		description:
			"High-performance ARM Cortex-M4 microcontroller with FPU. 1MB Flash, 192KB RAM. Suitable for industrial and embedded applications.",
		mpn: "STM32F407VGT6",
		manufacturer: "STMicroelectronics",
		category_id: "cat-1",
		condition: "new",
		quantity: 10,
		starting_price: 50,
		current_price: 85,
		reserve_price: 100,
		reserve_met: false,
		bid_increment: 5,
		start_time: now.toISOString(),
		end_time: endTime.toISOString(),
		original_end_time: endTime.toISOString(),
		extended: false,
		extension_count: 0,
		bid_count: 7,
		winning_bidder_id: null,
		winning_bidder_name: null,
		last_bid_time: null,
		status: "active",
		images: [],
		pdfs: [],
		thumbnail_url: "/rom-30098_1920.png",
		hide_bid_history: false,
		hide_time_remaining: false,
		featured_lot: true,
		keywords: ["stm32", "arm", "cortex-m4", "microcontroller"],
		allow_offers: true,
		minimum_offer: 80,
		created_by: null,
		created_at: now.toISOString(),
		updated_at: now.toISOString(),
		sold_at: null,
		sold_to: null,
		sold_price: null,
		view_count: 42,
		watch_count: 5,
	};
}

/** Mock lots for design-only grids (browse, home, ending-soon). */
export function createMockLots(count: number = 6): Lot[] {
	return Array.from({ length: count }, (_, i) =>
		createMockLot(`mock-lot-${i + 1}`)
	);
}
