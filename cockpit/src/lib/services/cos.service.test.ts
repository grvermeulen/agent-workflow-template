import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { replyAsCos, isCosLlmEnabled } from "@/lib/services/cos.service";
import type { ChatMessage } from "@/lib/schemas/chat";

describe("cos.service (planner fallback)", () => {
  beforeEach(() => {
    // No Anthropic key → Cos must fall back to the keyword planner.
    vi.stubEnv("ANTHROPIC_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports the LLM as disabled without a key", () => {
    expect(isCosLlmEnabled()).toBe(false);
  });

  it("answers in planner mode using the last user message", async () => {
    const messages: ChatMessage[] = [{ role: "user", content: "Bouw een dashboard" }];
    const reply = await replyAsCos(messages);
    expect(reply.mode).toBe("planner");
    expect(reply.intent).toBe("build");
    expect(reply.assignedTo).toContain("Bouwer");
    expect(reply.reply).toContain("Bouw een dashboard");
  });

  it("uses the most recent user turn from a longer history", async () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "hallo" },
      { role: "assistant", content: "Hoi, waarmee kan ik helpen?" },
      { role: "user", content: "werf een nieuwe agent voor SEO" },
    ];
    const reply = await replyAsCos(messages);
    expect(reply.intent).toBe("hire");
  });
});
