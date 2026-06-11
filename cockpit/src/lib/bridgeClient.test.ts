import { describe, expect, it } from "vitest";
import { buildBridgeUrl, buildHealthUrl, parseBridgeMessage } from "@/lib/bridgeClient";

describe("buildBridgeUrl", () => {
  it("voegt /term en token toe aan een kale host", () => {
    expect(buildBridgeUrl("terminal.example.com", "abc")).toBe(
      "wss://terminal.example.com/term?token=abc",
    );
  });

  it("herschrijft http(s) naar ws(s)", () => {
    expect(buildBridgeUrl("https://t.example.com", "abc")).toBe("wss://t.example.com/term?token=abc");
    expect(buildBridgeUrl("http://127.0.0.1:7070", "abc")).toBe(
      "ws://127.0.0.1:7070/term?token=abc",
    );
  });

  it("laat een expliciet pad intact", () => {
    expect(buildBridgeUrl("ws://127.0.0.1:7070/term", "abc")).toBe(
      "ws://127.0.0.1:7070/term?token=abc",
    );
  });

  it("geeft null bij lege of ongeldige invoer", () => {
    expect(buildBridgeUrl("", "abc")).toBeNull();
    expect(buildBridgeUrl("   ", "abc")).toBeNull();
    expect(buildBridgeUrl("ftp://x.example.com", "abc")).toBeNull();
  });
});

describe("buildHealthUrl", () => {
  it("leidt het https-healthz-adres af zonder token", () => {
    expect(buildHealthUrl("wss://t.example.com")).toBe("https://t.example.com/healthz");
    expect(buildHealthUrl("ws://127.0.0.1:7070")).toBe("http://127.0.0.1:7070/healthz");
  });

  it("geeft null bij ongeldige invoer", () => {
    expect(buildHealthUrl("")).toBeNull();
  });
});

describe("parseBridgeMessage", () => {
  it("parseert geldige berichten", () => {
    expect(parseBridgeMessage(JSON.stringify({ type: "data", data: "x" }))).toEqual({
      type: "data",
      data: "x",
    });
    expect(parseBridgeMessage(JSON.stringify({ type: "exit", code: 0 }))).toEqual({
      type: "exit",
      code: 0,
    });
  });

  it("geeft null bij kapotte JSON of onbekende vormen", () => {
    expect(parseBridgeMessage("geen json")).toBeNull();
    expect(parseBridgeMessage(JSON.stringify({ type: "data" }))).toBeNull();
    expect(parseBridgeMessage(JSON.stringify({ type: "onbekend" }))).toBeNull();
    expect(parseBridgeMessage(12 as unknown as string)).toBeNull();
  });
});
