import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { GenerateWizard } from "@/components/generate/GenerateWizard";

export default async function GerarPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const { tema } = await searchParams;
  return (
    <div>
      <PageHeader
        icon={<Sparkles className="size-5" />}
        title="Gerar post com IA"
        subtitle="Descreva o tema e receba opções completas: legenda, hashtags e imagem"
      />
      <GenerateWizard initialTheme={tema ?? ""} />
    </div>
  );
}
