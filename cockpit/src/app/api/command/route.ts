import { NextResponse } from "next/server";
import { commandRequestSchema } from "@/lib/schemas/command";
import { planCommand } from "@/lib/services/command.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/command — turns a "From The Pit" command into Cos's plan (dry run).
 *
 * @param request - The incoming request with a JSON `{ text }` body.
 * @returns The planned command result, or a 400/500 error.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = commandRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige opdracht" },
        { status: 400 },
      );
    }
    const result = planCommand(parsed.data.text);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("api.command", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
