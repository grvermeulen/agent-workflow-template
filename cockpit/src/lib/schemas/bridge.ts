import { z } from "zod";

/** Messages the bridge daemon sends over the terminal WebSocket. */
export const bridgeServerMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ready"), cwd: z.string(), shell: z.string() }),
  z.object({ type: z.literal("data"), data: z.string() }),
  z.object({ type: z.literal("exit"), code: z.number() }),
  z.object({ type: z.literal("error"), message: z.string() }),
  z.object({ type: z.literal("pong") }),
]);

export type BridgeServerMessage = z.infer<typeof bridgeServerMessageSchema>;
