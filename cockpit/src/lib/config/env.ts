import { z } from "zod";

/**
 * Environment schema for The Pit. Every integration credential is optional —
 * a missing credential degrades a tool to "offline" rather than crashing the app.
 */
const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_OWNER: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  ATLASSIAN_API_TOKEN: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_CODE_OAUTH_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Reads and validates the process environment once. Unknown keys are ignored;
 * blank strings are treated as "not set".
 *
 * @returns The validated, normalized environment.
 */
export function readEnv(): Env {
  const parsed = envSchema.parse(process.env);
  const normalized = Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [
      key,
      value && value.trim().length > 0 ? value : undefined,
    ]),
  );
  return normalized as Env;
}

/**
 * Returns true when every provided key is present (non-empty) in the environment.
 *
 * @param keys - The environment keys an integration requires.
 * @returns Whether the integration is fully configured.
 */
export function hasEnv(...keys: (keyof Env)[]): boolean {
  const env = readEnv();
  return keys.every((key) => Boolean(env[key]));
}
