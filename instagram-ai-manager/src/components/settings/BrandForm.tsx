"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, UserRound } from "lucide-react";
import { saveBrandProfile } from "@/actions/settings";
import type { SerializedBrandProfile } from "@/lib/types";
import { Button, Card, Field, inputCls } from "@/components/ui";

export function BrandForm({ initial }: { initial: SerializedBrandProfile }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  const set = (key: keyof SerializedBrandProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () =>
    startTransition(async () => {
      const res = await saveBrandProfile(form);
      if (res.ok) toast.success("Perfil da marca salvo!");
      else toast.error(res.error ?? "Erro ao salvar");
    });

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <UserRound className="size-4 text-insta-pink" /> Perfil da marca
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da marca / perfil">
          <input className={inputCls} value={form.brandName} onChange={set("brandName")} placeholder="@seuperfil" />
        </Field>
        <Field label="Nicho">
          <input className={inputCls} value={form.niche} onChange={set("niche")} placeholder="Ex.: fitness, moda, gastronomia…" />
        </Field>
        <Field label="Tom de voz">
          <input className={inputCls} value={form.toneOfVoice} onChange={set("toneOfVoice")} placeholder="Ex.: descontraído, inspirador, técnico…" />
        </Field>
        <Field label="Frequência de postagem">
          <input className={inputCls} value={form.postingFrequency} onChange={set("postingFrequency")} placeholder="Ex.: 3x por semana" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Público-alvo">
            <input className={inputCls} value={form.targetAudience} onChange={set("targetAudience")} placeholder="Quem você quer alcançar?" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Contexto extra para a IA"
            hint="Tudo que a IA deve saber: produtos, diferenciais, temas proibidos, bordões…"
          >
            <textarea rows={4} className={inputCls} value={form.extraContext} onChange={set("extraContext")} />
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={submit} loading={pending} icon={<Save className="size-4" />}>
          Salvar perfil
        </Button>
      </div>
    </Card>
  );
}
