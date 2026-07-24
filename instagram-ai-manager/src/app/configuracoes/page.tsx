import { KeyRound, Send, Settings } from "lucide-react";
import { getBrandProfile } from "@/actions/settings";
import { Card, PageHeader } from "@/components/ui";
import { PUBLISHERS, getPublisher } from "@/lib/publisher";
import { BrandForm } from "@/components/settings/BrandForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const brand = await getBrandProfile();
  const active = getPublisher();
  const keys = [
    { name: "ANTHROPIC_API_KEY", label: "Claude (textos)", set: Boolean(process.env.ANTHROPIC_API_KEY) },
    { name: "OPENAI_API_KEY", label: "OpenAI (imagens)", set: Boolean(process.env.OPENAI_API_KEY) },
    {
      name: "SUPABASE_URL + SUPABASE_KEY",
      label: "Supabase (banco e imagens)",
      set: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<Settings className="size-5" />}
        title="Configurações"
        subtitle="Perfil da marca que alimenta a IA, chaves e publicação"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BrandForm initial={brand} />
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <KeyRound className="size-4 text-insta-yellow" /> Chaves de API
            </h2>
            <ul className="space-y-2.5">
              {keys.map((k) => (
                <li key={k.name} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium">{k.label}</p>
                    <p className="text-xs text-ink-dim font-mono">{k.name}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      k.set
                        ? "border-insta-pink/40 bg-insta-pink/10 text-insta-pink"
                        : "border-edge bg-surface-2 text-ink-dim"
                    }`}
                  >
                    {k.set ? "Configurada" : "Ausente"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-dim">
              As chaves ficam no arquivo <code className="font-mono">.env</code> do
              servidor e nunca aparecem no navegador.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Send className="size-4 text-insta-orange" /> Publicação
            </h2>
            <ul className="space-y-2.5">
              {PUBLISHERS.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className={p.id === active.id ? "font-medium" : "text-ink-dim"}>
                    {p.label}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      p.id === active.id
                        ? "insta-gradient text-white border-transparent"
                        : "border-edge bg-surface-2 text-ink-dim"
                    }`}
                  >
                    {p.id === active.id ? "Ativo" : p.isConfigured() ? "Disponível" : "Não configurado"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-dim">
              A publicação automática via Instagram Graph API será ativada quando
              você configurar <code className="font-mono">IG_USER_ID</code> e{" "}
              <code className="font-mono">IG_ACCESS_TOKEN</code>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
