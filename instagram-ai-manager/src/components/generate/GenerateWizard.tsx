"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Clock,
  Hash,
  ImageIcon,
  Lightbulb,
  RefreshCw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { createPost } from "@/actions/posts";
import type { PostOption } from "@/lib/ai/schemas";

type Step = "brief" | "options" | "image";

const FORMATS = ["feed", "carrossel", "reels (capa)", "story"];

export function GenerateWizard({ initialTheme = "" }: { initialTheme?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("brief");

  // passo 1 — brief
  const [theme, setTheme] = useState(initialTheme);
  const [format, setFormat] = useState("feed");
  const [goal, setGoal] = useState("");

  // passo 2 — opções
  const [options, setOptions] = useState<PostOption[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  // passo 3 — imagem
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, startSaving] = useTransition();

  async function generateOptions() {
    if (theme.trim().length < 3) {
      toast.error("Descreva o tema do post");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, format, goal, count: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha na geração");
      setOptions(data.options);
      setChosen(null);
      setStep("options");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na geração");
    } finally {
      setGenerating(false);
    }
  }

  function pickOption(i: number) {
    setChosen(i);
    setImagePrompt(options[i].image_prompt);
    setImageUrl(null);
    setImageFile(null);
    setStep("image");
  }

  async function generateImage() {
    setImgLoading(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, ref: "gerado" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar imagem");
      setImageUrl(data.url);
      setImageFile(data.filename);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar imagem");
    } finally {
      setImgLoading(false);
    }
  }

  function save() {
    if (chosen === null) return;
    const opt = options[chosen];
    startSaving(async () => {
      const res = await createPost({
        caption: opt.caption,
        hashtags: opt.hashtags,
        imagePrompt,
        imageFile,
        theme,
        rationale: opt.rationale,
        suggestedTime: opt.suggested_time,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      if (res.ok && res.data) {
        toast.success(scheduledAt ? "Post agendado!" : "Rascunho salvo!");
        router.push(`/posts/${res.data.id}`);
      } else {
        toast.error(res.error ?? "Falha ao salvar");
      }
    });
  }

  /* ===== indicador de passos ===== */
  const steps: { key: Step; label: string }[] = [
    { key: "brief", label: "Brief" },
    { key: "options", label: "Opções" },
    { key: "image", label: "Imagem e salvar" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 shrink-0">
            <span
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                i <= stepIndex
                  ? "insta-gradient text-white"
                  : "bg-surface-2 text-ink-dim border border-edge"
              }`}
            >
              {i < stepIndex ? <Check className="size-3.5" /> : i + 1}. {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-edge" />}
          </div>
        ))}
      </div>

      {/* ===== Passo 1: brief ===== */}
      {step === "brief" && (
        <Card className="fade-up space-y-4">
          <Field label="Tema do post" hint="Quanto mais específico, melhor o resultado.">
            <textarea
              rows={3}
              className={inputCls}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex.: 5 erros que iniciantes cometem no treino de perna"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Formato">
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors min-h-11 sm:min-h-9 ${
                      format === f
                        ? "insta-gradient text-white border-transparent"
                        : "border-edge bg-surface-2 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Objetivo (opcional)">
              <input
                className={inputCls}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex.: gerar salvamentos e seguidores"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={generateOptions}
              loading={generating}
              icon={<Wand2 className="size-4" />}
            >
              {generating ? "Gerando com IA…" : "Gerar 3 opções"}
            </Button>
          </div>
        </Card>
      )}

      {/* ===== Passo 2: opções ===== */}
      {step === "options" && (
        <div className="space-y-4 fade-up">
          <div className="grid gap-4 lg:grid-cols-3">
            {options.map((opt, i) => (
              <Card key={i} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="insta-gradient-text text-xs font-bold uppercase tracking-wide">
                    Opção {i + 1}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-ink-dim">
                    <Clock className="size-3.5" /> {opt.suggested_time}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed max-h-56 overflow-y-auto">
                  {opt.caption}
                </p>
                <p className="flex items-start gap-1.5 text-xs text-ink-dim">
                  <Hash className="size-3.5 mt-0.5 shrink-0 text-insta-pink" />
                  <span className="line-clamp-2">
                    {opt.hashtags.map((h) => `#${h}`).join(" ")}
                  </span>
                </p>
                <p className="flex items-start gap-1.5 text-xs text-ink-dim italic">
                  <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-insta-yellow" />
                  {opt.rationale}
                </p>
                <Button
                  onClick={() => pickOption(i)}
                  className="mt-auto"
                  icon={<ArrowRight className="size-4" />}
                >
                  Escolher esta
                </Button>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setStep("brief")} icon={<ArrowLeft className="size-4" />}>
              Voltar
            </Button>
            <Button
              variant="ghost"
              onClick={generateOptions}
              loading={generating}
              icon={<RefreshCw className="size-4" />}
            >
              Gerar novas opções
            </Button>
          </div>
        </div>
      )}

      {/* ===== Passo 3: imagem + salvar ===== */}
      {step === "image" && chosen !== null && (
        <div className="grid gap-4 lg:grid-cols-2 fade-up">
          <Card className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ImageIcon className="size-4 text-insta-orange" /> Imagem do post
            </h3>
            <Field label="Prompt da imagem (em inglês)" hint="Edite à vontade antes de gerar.">
              <textarea
                rows={4}
                className={inputCls}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generateImage}
                loading={imgLoading}
                icon={<Sparkles className="size-4" />}
              >
                {imageUrl ? "Gerar outra" : "Gerar imagem"}
              </Button>
              <Button variant="outline" onClick={() => setStep("options")} icon={<ArrowLeft className="size-4" />}>
                Trocar opção
              </Button>
            </div>
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-edge bg-surface-2 grid place-items-center insta-ring">
              {imgLoading ? (
                <div className="flex flex-col items-center gap-2 text-ink-dim text-sm">
                  <span className="insta-gradient size-10 rounded-full animate-pulse" />
                  Gerando imagem…
                </div>
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Imagem gerada" className="size-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-dim text-sm px-6 text-center">
                  <ImageIcon className="size-8" />
                  A imagem aparecerá aqui. Você também pode salvar sem imagem e anexar depois.
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4 h-fit">
            <h3 className="flex items-center gap-2 font-semibold">
              <Save className="size-4 text-insta-pink" /> Salvar post
            </h3>
            <p className="whitespace-pre-wrap rounded-xl border border-edge bg-surface-2 p-3 text-sm max-h-48 overflow-y-auto">
              {options[chosen].caption}
            </p>
            <Field
              label="Agendar para (opcional)"
              hint={`Sugestão da IA: ${options[chosen].suggested_time}`}
            >
              <input
                type="datetime-local"
                className={inputCls}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </Field>
            <Button
              onClick={save}
              loading={saving}
              className="w-full"
              icon={<CalendarClock className="size-4" />}
            >
              {scheduledAt ? "Salvar e agendar" : "Salvar como rascunho"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
