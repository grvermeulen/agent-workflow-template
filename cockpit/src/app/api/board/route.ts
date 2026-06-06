import { NextResponse } from "next/server";
import { getBoard } from "@/lib/services/work.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/board — the work board (backlog / in-progress / done).
 *
 * @returns The board summary and items, or a 500 on failure.
 */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json(await getBoard());
  } catch (error: unknown) {
    logger.error("api.board", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
