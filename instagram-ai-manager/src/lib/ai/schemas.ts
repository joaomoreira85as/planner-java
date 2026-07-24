import { z } from "zod";

/* ===== Contrato da geração de posts (Claude structured outputs) ===== */

export const postOptionZod = z.object({
  caption: z.string().min(1),
  hashtags: z.array(z.string().min(1)).min(5).max(30),
  image_prompt: z.string().min(1),
  suggested_time: z.string().min(1),
  rationale: z.string().min(1),
});

export const postOptionsZod = z.object({
  options: z.array(postOptionZod).min(1).max(6),
});

export type PostOption = z.infer<typeof postOptionZod>;

/**
 * JSON Schema enviado ao Claude via output_config.format.
 * Structured outputs exigem additionalProperties:false e required completos;
 * limites de quantidade/tamanho são reforçados no prompt e validados pelo Zod.
 */
export const POST_OPTIONS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["options"],
  properties: {
    options: {
      type: "array",
      description: "Opções de post geradas",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "hashtags", "image_prompt", "suggested_time", "rationale"],
        properties: {
          caption: {
            type: "string",
            description:
              "Legenda completa em português do Brasil, pronta para postar, com quebras de linha, emojis moderados e chamada para ação. NÃO incluir hashtags na legenda.",
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description:
              "15 a 25 hashtags SEM o caractere '#', misturando alcance alto, médio e de nicho, relevantes para o tema e o público.",
          },
          image_prompt: {
            type: "string",
            description:
              "Prompt EM INGLÊS para gerador de imagem (formato quadrado 1:1, estilo fotográfico ou ilustrado coerente com a marca). NÃO pedir texto renderizado na imagem.",
          },
          suggested_time: {
            type: "string",
            description:
              "Melhor dia da semana e horário para postar, em português. Ex.: 'quarta-feira às 19h'.",
          },
          rationale: {
            type: "string",
            description:
              "1 a 2 frases explicando por que essa opção deve engajar esse público.",
          },
        },
      },
    },
  },
} as const;

/* ===== Entrada do wizard ===== */

export const generateBriefZod = z.object({
  theme: z.string().min(2, "Descreva o tema do post").max(500),
  format: z.string().max(100).optional().default("feed"),
  goal: z.string().max(300).optional().default(""),
  count: z.number().int().min(1).max(5).optional().default(3),
});

export type GenerateBrief = z.infer<typeof generateBriefZod>;
