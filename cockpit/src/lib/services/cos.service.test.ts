import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { replyAsCos, isCosLlmEnabled, isCosSubscriptionEnabled } from "@/lib/services/cos.service";
import { logger } from "@/lib/logger";
import type { ChatMessage } from "@/lib/schemas/chat";

// Hoisted mocks so the heavy SDKs are never really loaded/spawned in tests.
const { queryMock, createMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  createMock: vi.fn(),
}));
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({ query: queryMock }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

describe("cos.service", () => {
  beforeEach(() => {
    // No credentials → Cos must fall back to the keyword planner.
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("reports the LLM as disabled without any credentials", () => {
    expect(isCosLlmEnabled()).toBe(false);
    expect(isCosSubscriptionEnabled()).toBe(false);
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

  it("answers via the Claude subscription when a token is set", async () => {
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "oat-test");
    queryMock.mockImplementation(async function* () {
      yield {
        type: "assistant",
        message: { content: [{ type: "text", text: "Hoi, ik ben Cos." }] },
      };
    });

    const reply = await replyAsCos([{ role: "user", content: "hallo" }]);

    expect(queryMock).toHaveBeenCalledOnce();
    expect(createMock).not.toHaveBeenCalled();
    expect(reply.mode).toBe("llm");
    expect(reply.reply).toBe("Hoi, ik ben Cos.");
  });

  it("falls back from a failing subscription to the API", async () => {
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "oat-test");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    queryMock.mockImplementation(async function* () {
      throw new Error("Claude Code onbereikbaar");
    });
    createMock.mockResolvedValue({ content: [{ type: "text", text: "Antwoord via API." }] });
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);

    const reply = await replyAsCos([{ role: "user", content: "hallo" }]);

    expect(reply.mode).toBe("llm");
    expect(reply.reply).toBe("Antwoord via API.");
    expect(errorSpy).toHaveBeenCalledWith("cos.replyViaClaudeCode", expect.any(Error));
  });

  it("falls back to the planner (and logs) when the API errors", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    createMock.mockRejectedValueOnce(new Error("API onbereikbaar"));
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);

    const reply = await replyAsCos([{ role: "user", content: "Bouw een dashboard" }]);

    expect(reply.mode).toBe("planner");
    expect(reply.intent).toBe("build");
    expect(errorSpy).toHaveBeenCalledWith("cos.replyViaApi", expect.any(Error));
  });
});
