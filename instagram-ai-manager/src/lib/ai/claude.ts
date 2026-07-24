import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  POST_OPTIONS_JSON_SCHEMA,
  postOptionsZod,
  type GenerateBrief,
  type PostOption,
} from "./schemas";
import { buildGenerateBrief, buildInsightsPrompt, buildSystemPrompt } from "./prompts";
import type { SerializedBrandProfile } from "@/lib/types";

const MODEL = "claude-opus-4-8";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiConfigError(
      "ANTHROPIC_API_KEY não configurada. Adicione a chave no arquivo .env."
    );
  }
  return (_client ??= new Anthropic());
}

export class AiConfigError extends Error {}

export async function generatePostOptions(
  brief: GenerateBrief,
  brand: SerializedBrandProfile
): Promise<PostOption[]> {
  const client = getClient();

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      format: { type: "json_schema", schema: POST_OPTIONS_JSON_SCHEMA },
    },
    system: buildSystemPrompt(brand),
    messages: [{ role: "user", content: buildGenerateBrief(brief) }],
  });

  const msg = await stream.finalMessage();

  if (msg.stop_reason === "refusal") {
    throw new Error("A IA recusou esse tema. Tente reformular o pedido.");
  }
  if (msg.stop_reason === "max_tokens") {
    throw new Error("A resposta ficou longa demais. Tente gerar menos opções.");
  }

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const parsed = postOptionsZod.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error("A IA retornou um formato inesperado. Tente novamente.");
  }
  return parsed.data.options.map((o) => ({
    ...o,
    hashtags: o.hashtags.map((h) => h.replace(/^#/, "").trim()).filter(Boolean),
  }));
}

/** Stream de insights (texto livre em Markdown) para SSE. */
export function streamInsights(
  payload: Parameters<typeof buildInsightsPrompt>[0],
  brand: SerializedBrandProfile
) {
  const client = getClient();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: buildSystemPrompt(brand),
    messages: [{ role: "user", content: buildInsightsPrompt(payload) }],
  });
}
