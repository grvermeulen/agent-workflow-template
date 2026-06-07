import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { replyAsCos, isCosLlmEnabled, isCosSubscriptionEnabled } from "@/lib/services/cos.service";
import { logger } from "@/lib/logger";
import type { ChatMessage } from "@/lib/schemas/chat";

// Hoisted mocks so the heavy SDKs are never really loaded/spawned in tests.
const { queryMock, createMock, dispatchMock, isDispatchConfiguredMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  createMock: vi.fn(),
  dispatchMock: vi.fn(),
  isDispatchConfiguredMock: vi.fn(),
}));
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({ query: queryMock }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));
vi.mock("@/lib/services/dispatch.service", () => ({
  isDispatchConfigured: isDispatchConfiguredMock,
  dispatchToClaudeCode: dispatchMock,
}));

describe("cos.service", () => {
  beforeEach(() => {
    // No credentials → Cos falls back to the planner; not on Vercel; no delegation.
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "");
    vi.stubEnv("VERCEL", "");
    vi.clearAllMocks();
    isDispatchConfiguredMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("reports the LLM as disabled without any credentials", () => {
    expect(isCosLlmEnabled()).toBe(false);
    expect(isCosSubscriptionEnabled()).toBe(false);
  });

  it("explains delegation isn't configured for build work without COS_WORK_REPO", async () => {
    const reply = await replyAsCos([{ role: "user", content: "Bouw een dashboard" }]);
    expect(reply.intent).toBe("build");
    expect(reply.mode).toBe("planner");
    expect(reply.reply).toContain("COS_WORK_REPO");
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("answers via the Claude subscription off-Vercel when a token is set", async () => {
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "oat-test");
    queryMock.mockImplementation(async function* () {
      yield {
        type: "assistant",
        message: { content: [{ type: "text", text: "Hoi, ik ben Cos." }] },
      };
    });

    const reply = await replyAsCos([{ role: "user", content: "hallo" }]);

    expect(queryMock).toHaveBeenCalledOnce();
    expect(reply.mode).toBe("llm");
    expect(reply.reply).toBe("Hoi, ik ben Cos.");
  });

  it("skips the subscription path on Vercel (subprocess can't run) and uses the planner", async () => {
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "oat-test");
    vi.stubEnv("VERCEL", "1");

    const reply = await replyAsCos([{ role: "user", content: "hallo" }]);

    expect(queryMock).not.toHaveBeenCalled();
    expect(reply.mode).toBe("planner");
  });

  it("answers tool/key status itself, without the LLM or delegation", async () => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_test");
    const reply = await replyAsCos([{ role: "user", content: "welke keys zijn verbonden?" }]);
    expect(reply.mode).toBe("planner");
    expect(reply.intent).toBe("status");
    expect(reply.reply).toContain("GitHub");
    expect(reply.reply).toContain("✅");
    expect(reply.reply).toContain("ChatGPT");
    expect(queryMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("delegates build work to Claude Code on GitHub when configured", async () => {
    isDispatchConfiguredMock.mockReturnValue(true);
    dispatchMock.mockResolvedValue({ number: 7, url: "https://github.com/o/r/issues/7" });

    const reply = await replyAsCos([{ role: "user", content: "Bouw een landingspagina" }]);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith("Bouw een landingspagina");
    expect(queryMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(reply.mode).toBe("delegated");
    expect(reply.intent).toBe("build");
    expect(reply.url).toBe("https://github.com/o/r/issues/7");
    expect(reply.reply).toContain("#7");
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

    const reply = await replyAsCos([{ role: "user", content: "vertel een mop" }]);

    expect(reply.mode).toBe("planner");
    expect(errorSpy).toHaveBeenCalledWith("cos.replyViaApi", expect.any(Error));
  });
});
