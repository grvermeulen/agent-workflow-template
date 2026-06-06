import { NextResponse } from "next/server";
import { getActivity } from "@/lib/services/activity.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/activity — the cockpit activity stream.
 *
 * @returns Recent activity items, or a 500 on failure.
 */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json(await getActivity());
  } catch (error: unknown) {
    logger.error("api.activity", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
