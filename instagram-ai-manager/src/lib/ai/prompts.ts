import type { SerializedBrandProfile } from "@/lib/types";
import type { GenerateBrief } from "./schemas";

export function buildSystemPrompt(brand: SerializedBrandProfile): string {
  const lines = [
    "Você é um estrategista de conteúdo sênior especializado em Instagram no Brasil.",
    "Responda sempre em português do Brasil.",
    "Crie conteúdo autêntico e específico para a marca abaixo — nada genérico.",
    "",
    "## Perfil da marca",
    brand.brandName && `Nome: ${brand.brandName}`,
    brand.niche && `Nicho: ${brand.niche}`,
    brand.toneOfVoice && `Tom de voz: ${brand.toneOfVoice}`,
    brand.targetAudience && `Público-alvo: ${brand.targetAudience}`,
    brand.postingFrequency && `Frequência de postagem: ${brand.postingFrequency}`,
    brand.extraContext && `Contexto adicional: ${brand.extraContext}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildGenerateBrief(brief: GenerateBrief): string {
  return [
    `Gere exatamente ${brief.count} opções distintas de post para Instagram sobre o tema: "${brief.theme}".`,
    `Formato do post: ${brief.format}.`,
    brief.goal && `Objetivo do post: ${brief.goal}.`,
    "",
    "Regras:",
    "- Cada opção deve ter um ângulo/abordagem diferente (ex.: educativo, storytelling, polêmico saudável, lista prática).",
    "- Legenda pronta para colar no Instagram: gancho forte na primeira linha, corpo escaneável, CTA no final. Sem hashtags dentro da legenda.",
    "- 15 a 25 hashtags por opção, sem '#', misturando alcance alto, médio e nicho.",
    "- image_prompt em inglês, descrevendo uma imagem quadrada (1:1) atraente, sem texto renderizado.",
    "- suggested_time deve considerar hábitos do público brasileiro nesse nicho.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildInsightsPrompt(payload: {
  followers: { count: number; recordedAt: string }[];
  posts: {
    caption: string;
    theme: string | null;
    status: string;
    publishedAt: string | null;
    hashtags: string[];
    metrics: { likes: number; comments: number; saves: number; shares: number; reach: number }[];
  }[];
}): string {
  return [
    "Analise os dados reais do meu Instagram abaixo (inseridos manualmente por mim) e gere um relatório de insights em português do Brasil, em Markdown, com estas seções:",
    "1. **O que está funcionando** — temas, formatos e horários com melhor engajamento.",
    "2. **O que melhorar** — padrões fracos e hipóteses do porquê.",
    "3. **Crescimento de seguidores** — tendência e ritmo.",
    "4. **Próximos passos** — 5 sugestões concretas de conteúdo para as próximas 2 semanas, alinhadas ao que os dados mostram.",
    "",
    "Seja direto e específico; cite números dos dados quando relevante. Se houver poucos dados, diga o que ainda não dá para concluir e o que registrar daqui para frente.",
    "",
    "## Dados",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");
}
