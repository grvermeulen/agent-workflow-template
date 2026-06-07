import type { CommandIntent, CommandResult } from "@/lib/schemas/command";

type IntentRule = {
  intent: Exclude<CommandIntent, "unknown">;
  keywords: string[];
  assignedTo: string;
  plan: (text: string) => string;
};

const INTENT_RULES: IntentRule[] = [
  {
    intent: "build",
    keywords: ["bouw", "maak", "build", "ontwikkel", "implementeer", "app"],
    assignedTo: "Bouwer (Claude Code)",
    plan: (text) =>
      `Een GitHub-issue aanmaken met de requirements voor "${text}", de Bouwer toewijzen en op de backlog plaatsen.`,
  },
  {
    intent: "research",
    keywords: ["onderzoek", "research", "zoek uit", "vergelijk", "analyseer"],
    assignedTo: "Onderzoeker (ChatGPT/Gemini/xAI)",
    plan: (text) => `De Onderzoeker inzetten op "${text}" en de bevindingen terugkoppelen.`,
  },
  {
    intent: "hire",
    keywords: ["werf", "hire", "nieuwe agent", "team", "expertise"],
    assignedTo: "HR-agent",
    plan: (text) =>
      `Een agent-spec opstellen voor "${text}", de agent aanmaken en met minimale rechten aan het rooster toevoegen.`,
  },
  {
    intent: "deploy",
    keywords: ["deploy", "publiceer", "live", "release", "vercel"],
    assignedTo: "Cos (Vercel)",
    plan: (text) => `De wijziging voor "${text}" naar productie deployen op Vercel en loggen.`,
  },
  {
    intent: "status",
    keywords: [
      "status",
      "hoe staat",
      "voortgang",
      "wat doet",
      "overzicht",
      "key",
      "keys",
      "sleutel",
      "sleutels",
      "sleutelnaam",
      "sleutelnamen",
      "verbonden",
      "gekoppeld",
      "connected",
      "checklist",
      "aanwezig",
      "ontbreekt",
      ".env",
      "env-bestand",
    ],
    assignedTo: "Cos",
    plan: () =>
      `Een overzicht geven van de backlog, lopend werk en de status van alle gekoppelde tools.`,
  },
];

/**
 * Derives a command intent from free text using keyword matching.
 *
 * @param text - The raw command ("what").
 * @returns The best-matching intent, or "unknown".
 */
export function detectIntent(text: string): CommandIntent {
  const haystack = text.toLowerCase();
  const match = INTENT_RULES.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(keyword)),
  );
  return match?.intent ?? "unknown";
}

/**
 * Turns a command into Cos's plan. v1 is always a dry run: Cos states the "how"
 * before any mutating action, in line with the human-in-the-loop gates.
 *
 * @param text - The raw command ("what").
 * @returns The planned response.
 */
export function planCommand(text: string): CommandResult {
  const intent = detectIntent(text);
  const rule = INTENT_RULES.find((candidate) => candidate.intent === intent);

  if (!rule) {
    return {
      intent: "unknown",
      plan: `Nog geen duidelijke intentie herkend in "${text}". Cos vraagt om verheldering voordat hij delegeert.`,
      assignedTo: "Cos",
      dryRun: true,
    };
  }

  return {
    intent: rule.intent,
    plan: rule.plan(text),
    assignedTo: rule.assignedTo,
    dryRun: true,
  };
}
