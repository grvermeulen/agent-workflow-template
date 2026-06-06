import { describe, it, expect } from "vitest";
import { detectIntent, planCommand } from "@/lib/services/command.service";

describe("command.service", () => {
  it("detects a build intent from Dutch keywords", () => {
    expect(detectIntent("Bouw een landingspagina")).toBe("build");
  });

  it("detects a hire intent", () => {
    expect(detectIntent("werf een nieuwe agent voor SEO")).toBe("hire");
  });

  it("falls back to unknown when nothing matches", () => {
    expect(detectIntent("xyzzy")).toBe("unknown");
  });

  it("plans a build command as an assigned dry run", () => {
    const result = planCommand("Bouw een dashboard");
    expect(result.intent).toBe("build");
    expect(result.dryRun).toBe(true);
    expect(result.assignedTo).toContain("Bouwer");
    expect(result.plan).toContain("Bouw een dashboard");
  });

  it("asks for clarification on an unknown command", () => {
    const result = planCommand("qwerty");
    expect(result.intent).toBe("unknown");
    expect(result.assignedTo).toBe("Cos");
    expect(result.dryRun).toBe(true);
  });
});
