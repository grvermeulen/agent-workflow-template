import { bridgeServerMessageSchema, type BridgeServerMessage } from "@/lib/schemas/bridge";

/**
 * Normalizes a user-supplied bridge address into a connectable WebSocket URL.
 * Accepts `ws://`, `wss://`, `http(s)://` (rewritten to ws/wss) and bare hosts
 * (assumed `wss://`). Ensures the `/term` path and appends the auth token.
 *
 * @param rawUrl - The bridge address as entered by the user or configured via env.
 * @param token - The shared bridge token.
 * @returns The full WebSocket URL, or null when the input is not a valid URL.
 */
export function buildBridgeUrl(rawUrl: string, token: string): string | null {
  let input = rawUrl.trim();
  if (input.length === 0) return null;
  if (!/^[a-z]+:\/\//i.test(input)) input = `wss://${input}`;
  input = input.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== "ws:" && url.protocol !== "wss:") return null;
  if (url.pathname === "/" || url.pathname === "") url.pathname = "/term";
  url.searchParams.set("token", token);
  return url.toString();
}

/**
 * Parses and validates a raw WebSocket frame from the bridge.
 *
 * @param raw - The raw message payload.
 * @returns The validated message, or null when it is not a known bridge message.
 */
export function parseBridgeMessage(raw: unknown): BridgeServerMessage | null {
  if (typeof raw !== "string") return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = bridgeServerMessageSchema.safeParse(json);
  return result.success ? result.data : null;
}

/**
 * Derives the `/healthz` URL for a bridge address, used for online-detection.
 *
 * @param rawUrl - The bridge address as entered by the user.
 * @returns The health endpoint URL, or null when the input is not a valid URL.
 */
export function buildHealthUrl(rawUrl: string): string | null {
  const ws = buildBridgeUrl(rawUrl, "x");
  if (!ws) return null;
  const url = new URL(ws);
  url.protocol = url.protocol === "wss:" ? "https:" : "http:";
  url.pathname = "/healthz";
  url.search = "";
  return url.toString();
}
