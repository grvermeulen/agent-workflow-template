import { NextResponse } from "next/server";
import { getToolStatuses, getConnectedCount } from "@/lib/services/toolStatus.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/status — the connection status of every tool Cos oversees.
 *
 * @returns Tool statuses and a connected count, or a 500 on failure.
 */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json({
      tools: getToolStatuses(),
      connected: getConnectedCount(),
    });
  } catch (error: unknown) {
    logger.error("api.status", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
