import { json, type RequestHandler } from "@sveltejs/kit";
import { sendEndingSoonNotifications } from "$lib/server/cron-jobs";

/**
 * POST /api/cron/ending-soon-notifications
 * Send ending soon notifications
 * Called by scheduled task runner
 */
export const POST: RequestHandler = async (event) => {
  // TODO: Add authentication/authorization check
  // const authHeader = event.request.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return json({ error: "Unauthorized" }, { status: 401 });
  // }

  const result = await sendEndingSoonNotifications();
  return json(result);
};

