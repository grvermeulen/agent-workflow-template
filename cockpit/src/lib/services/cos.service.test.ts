import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { replyAsCos, isCosLlmEnabled } from "@/lib/services/cos.service";
import { logger } from "@/lib/logger";
import type { ChatMessage } from "@/lib/schemas/chat";

// Mock the Anthropic SDK so the LLM path can be exercised without a real call.
const createMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

describe("cos.service (planner fallback)", () => {
  beforeEach(() => {
    // No Anthropic key → Cos must fall back to the keyword planner.
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.clearAllMocks();
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

  it("falls back to the planner (and logs) when Claude errors", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    createMock.mockRejectedValueOnce(new Error("Claude is onbereikbaar"));
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);

    const reply = await replyAsCos([{ role: "user", content: "Bouw een dashboard" }]);

    expect(createMock).toHaveBeenCalledOnce();
    expect(reply.mode).toBe("planner");
    expect(reply.intent).toBe("build");
    expect(errorSpy).toHaveBeenCalledWith("cos.replyAsCos", expect.any(Error));
  });
});
