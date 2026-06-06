import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getToolStatuses, getConnectedCount } from "@/lib/services/toolStatus.service";

describe("toolStatus.service", () => {
  beforeEach(() => {
    // Start from a clean slate so presence is fully controlled per test.
    for (const key of [
      "GITHUB_TOKEN",
      "VERCEL_TOKEN",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
    ]) {
      vi.stubEnv(key, "");
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks a tool connected when its credentials are present", () => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_test");
    const github = getToolStatuses().find((tool) => tool.id === "github");
    expect(github?.state).toBe("connected");
  });

  it("marks a credential-less tool offline", () => {
    const vercel = getToolStatuses().find((tool) => tool.id === "vercel");
    expect(vercel?.state).toBe("offline");
  });

  it("treats local IDE tools as degraded (manual) rather than offline", () => {
    const cursor = getToolStatuses().find((tool) => tool.id === "cursor");
    expect(cursor?.state).toBe("degraded");
  });

  it("requires all keys for a multi-key integration", () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co");
    const offline = getToolStatuses().find((tool) => tool.id === "supabase");
    expect(offline?.state).toBe("offline");

    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    const connected = getToolStatuses().find((tool) => tool.id === "supabase");
    expect(connected?.state).toBe("connected");
  });

  it("counts connected tools", () => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_test");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant");
    expect(getConnectedCount()).toBe(2);
  });
});
