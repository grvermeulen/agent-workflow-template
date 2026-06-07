import { hasEnv, type Env } from "@/lib/config/env";
import type { ToolStatus, ToolCategory } from "@/lib/schemas/tool";

type ToolDefinition = {
  id: string;
  name: string;
  category: ToolCategory;
  /** Env keys that must all be present for the tool to be "connected". */
  requires: (keyof Env)[];
  /** Any one of these env keys being present marks the tool "connected". */
  requiresAny?: (keyof Env)[];
  /** Local/IDE tool with no API credential — shown as degraded ("manual") when unmet. */
  manual?: boolean;
};

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    category: "build",
    requires: [],
    // Connected via the Claude subscription (OAuth token) OR the Anthropic API key.
    requiresAny: ["CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
  },
  // Connected when an API key is set; otherwise shown as a manually-used IDE tool.
  { id: "cursor", name: "Cursor", category: "build", requires: ["CURSOR_API_KEY"], manual: true },
  { id: "github", name: "GitHub", category: "infra", requires: ["GITHUB_TOKEN"] },
  { id: "vercel", name: "Vercel", category: "infra", requires: ["VERCEL_TOKEN"] },
  {
    id: "supabase",
    name: "Supabase",
    category: "infra",
    requires: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
  },
  { id: "slack", name: "Slack", category: "comms", requires: ["SLACK_BOT_TOKEN"] },
  { id: "atlassian", name: "Atlassian", category: "comms", requires: ["ATLASSIAN_API_TOKEN"] },
  { id: "chatgpt", name: "ChatGPT", category: "model", requires: ["OPENAI_API_KEY"] },
  {
    id: "gemini",
    name: "Gemini",
    category: "model",
    requires: [],
    requiresAny: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
  },
  { id: "xai", name: "xAI", category: "model", requires: ["XAI_API_KEY"] },
  { id: "elevenlabs", name: "ElevenLabs", category: "model", requires: ["ELEVENLABS_API_KEY"] },
];

/**
 * Derives a tool's connection state and Dutch detail from the environment.
 *
 * @param definition - The tool definition.
 * @returns The resolved tool status.
 */
function resolveTool(definition: ToolDefinition): ToolStatus {
  const configured =
    (definition.requires.length > 0 && hasEnv(...definition.requires)) ||
    Boolean(definition.requiresAny?.some((key) => hasEnv(key)));

  if (configured) {
    return {
      id: definition.id,
      name: definition.name,
      category: definition.category,
      state: "connected",
      detail: "Verbonden",
    };
  }

  if (definition.manual) {
    return {
      id: definition.id,
      name: definition.name,
      category: definition.category,
      state: "degraded",
      detail: "Handmatig gekoppeld",
    };
  }

  return {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    state: "offline",
    detail: "Geen credentials",
  };
}

/**
 * Returns the status of every tool Cos oversees, derived from configured credentials.
 *
 * @returns The full list of tool statuses.
 */
export function getToolStatuses(): ToolStatus[] {
  return TOOL_DEFINITIONS.map(resolveTool);
}

/**
 * Counts how many tools are fully connected.
 *
 * @returns The number of tools in the "connected" state.
 */
export function getConnectedCount(): number {
  return getToolStatuses().filter((tool) => tool.state === "connected").length;
}
