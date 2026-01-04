import { json, type RequestHandler } from "@sveltejs/kit";
import { closeAuctions } from "$lib/server/cron-jobs";

/**
 * POST /api/cron/close-auctions
 * Close expired auctions
 * Called by scheduled task runner
 */
export const POST: RequestHandler = async (event) => {
  // TODO: Add authentication/authorization check (e.g., check for secret header)
  // const authHeader = event.request.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return json({ error: "Unauthorized" }, { status: 401 });
  // }

  const result = await closeAuctions();
  return json(result);
};

