import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/schemas/chat";
import { replyAsCos } from "@/lib/services/cos.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/chat — Cos replies to a "From The Pit" conversation. Uses Claude when
 * configured, otherwise the keyword planner (see `cos.service`).
 *
 * @param request - The incoming request with a JSON `{ messages }` body.
 * @returns Cos's reply, or a 400/500 error.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige opdracht" },
        { status: 400 },
      );
    }
    const reply = await replyAsCos(parsed.data.messages);
    return NextResponse.json(reply);
  } catch (error: unknown) {
    logger.error("api.chat", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
