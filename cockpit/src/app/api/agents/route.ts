import { NextResponse } from "next/server";
import { getAgents } from "@/lib/services/agents.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/agents — Cos's agent roster with purposes and access rights.
 *
 * @returns The roster, or a 500 on failure.
 */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json({ agents: getAgents() });
  } catch (error: unknown) {
    logger.error("api.agents", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
