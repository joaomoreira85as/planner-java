"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarClock,
  Check,
  ClipboardCopy,
  Download,
  Hash,
  ImageIcon,
  Images,
  Lightbulb,
  Pencil,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import {
  deletePost,
  publishPost,
  setPostStatus,
  updatePost,
} from "@/actions/posts";
import { addPostMetric } from "@/actions/metrics";
import type { SerializedMetric, SerializedPost } from "@/lib/types";
import { Button, Card, Field, inputCls, PageHeader, StatusBadge } from "@/components/ui";
import { formatDateLong, formatDateShort } from "@/lib/format";

export function PostDetail({
  post: initial,
  metrics,
}: {
  post: SerializedPost;
  metrics: SerializedMetric[];
}) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [caption, setCaption] = useState(initial.caption);
  const [hashtags, setHashtags] = useState(initial.hashtags.join(" "));
  const [imagePrompt, setImagePrompt] = useState(initial.imagePrompt ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initial.scheduledAt ? initial.scheduledAt.slice(0, 16) : ""
  );
  const [editing, setEditing] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const parseHashtags = () =>
    hashtags
      .split(/[\s,]+/)
      .map((h) => h.replace(/^#/, "").trim())
      .filter(Boolean)
      .slice(0, 30);

  const saveEdits = () =>
    startTransition(async () => {
      const res = await updatePost(post.id, {
        caption,
        hashtags: parseHashtags(),
        imagePrompt: imagePrompt || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      if (res.ok && res.data) {
        setPost(res.data);
        setEditing(false);
        toast.success("Post atualizado!");
      } else toast.error(res.error ?? "Erro ao salvar");
    });

  const schedule = () =>
    startTransition(async () => {
      if (!scheduledAt) {
        toast.error("Escolha data e horário");
        return;
      }
      const res = await updatePost(post.id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      if (res.ok && res.data) {
        const res2 = await setPostStatus(post.id, "agendado");
        if (res2.ok && res2.data) {
          setPost(res2.data);
          toast.success("Post agendado!");
        }
      } else toast.error(res.error ?? "Erro ao agendar");
    });

  const publish = () =>
    startTransition(async () => {
      const res = await publishPost(post.id);
      if (res.ok && res.data) {
        setPost(res.data);
        toast.success("Post pronto! Copie a legenda e poste no Instagram.");
      } else toast.error(res.error ?? "Erro ao publicar");
    });

  const markPublished = () =>
    startTransition(async () => {
      const res = await setPostStatus(post.id, "publicado");
      if (res.ok && res.data) {
        setPost(res.data);
        toast.success("Marcado como publicado! 🎉");
      } else toast.error(res.error ?? "Erro");
    });

  const remove = () => {
    if (!confirm("Excluir este post?")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (res.ok) {
        toast.success("Post excluído");
        router.push("/posts");
      } else toast.error(res.error ?? "Erro ao excluir");
    });
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiada!`);
  };

  async function regenerateImage() {
    if (!imagePrompt) {
      toast.error("Escreva um prompt de imagem");
      return;
    }
    setImgLoading(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, ref: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar imagem");
      const upd = await updatePost(post.id, {
        imageFile: data.filename,
        imagePrompt,
      });
      if (upd.ok && upd.data) {
        setPost(upd.data);
        toast.success("Nova imagem gerada!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar imagem");
    } finally {
      setImgLoading(false);
    }
  }

  /* métricas rápidas */
  const [m, setM] = useState({ likes: "", comments: "", saves: "", shares: "", reach: "" });
  const saveMetric = () =>
    startTransition(async () => {
      const res = await addPostMetric({
        postId: post.id,
        likes: Number(m.likes) || 0,
        comments: Number(m.comments) || 0,
        saves: Number(m.saves) || 0,
        shares: Number(m.shares) || 0,
        reach: Number(m.reach) || 0,
      });
      if (res.ok) {
        toast.success("Métricas registradas!");
        router.refresh();
      } else toast.error(res.error ?? "Erro");
    });

  const fullCaption = `${post.caption}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`;

  return (
    <div>
      <PageHeader
        icon={<Images className="size-5" />}
        title="Detalhes do post"
        subtitle={
          post.scheduledAt
            ? `Agendado para ${formatDateLong(post.scheduledAt)}`
            : `Criado em ${formatDateShort(post.createdAt)}`
        }
        actions={<StatusBadge status={post.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ===== Imagem ===== */}
        <Card className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-edge bg-surface-2 grid place-items-center insta-ring">
            {imgLoading ? (
              <div className="flex flex-col items-center gap-2 text-ink-dim text-sm">
                <span className="insta-gradient size-10 rounded-full animate-pulse" />
                Gerando imagem…
              </div>
            ) : post.imageFile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/images/${post.imageFile}`}
                alt="Imagem do post"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-dim text-sm">
                <ImageIcon className="size-8" /> Sem imagem
              </div>
            )}
          </div>
          <Field label="Prompt da imagem">
            <textarea
              rows={3}
              className={inputCls}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={regenerateImage}
              loading={imgLoading}
              icon={<RefreshCw className="size-4" />}
            >
              {post.imageFile ? "Regenerar imagem" : "Gerar imagem"}
            </Button>
            {post.imageFile && (
              <a href={`/api/images/${post.imageFile}`} download={`post-${post.id}.png`}>
                <Button variant="outline" icon={<Download className="size-4" />}>
                  Baixar imagem
                </Button>
              </a>
            )}
          </div>
        </Card>

        {/* ===== Conteúdo ===== */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Legenda e hashtags</h3>
              <Button
                variant="ghost"
                onClick={() => setEditing((v) => !v)}
                icon={<Pencil className="size-4" />}
              >
                {editing ? "Cancelar" : "Editar"}
              </Button>
            </div>

            {editing ? (
              <>
                <Field label="Legenda">
                  <textarea
                    rows={8}
                    className={inputCls}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </Field>
                <Field label="Hashtags" hint="Separadas por espaço, com ou sem #">
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </Field>
                <Button onClick={saveEdits} loading={pending} icon={<Save className="size-4" />}>
                  Salvar alterações
                </Button>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto">
                  {post.caption}
                </p>
                <p className="flex items-start gap-1.5 text-xs text-ink-dim">
                  <Hash className="size-3.5 mt-0.5 shrink-0 text-insta-pink" />
                  {post.hashtags.map((h) => `#${h}`).join(" ") || "sem hashtags"}
                </p>
                {post.rationale && (
                  <p className="flex items-start gap-1.5 text-xs text-ink-dim italic">
                    <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-insta-yellow" />
                    {post.rationale}
                  </p>
                )}
              </>
            )}
          </Card>

          {/* ===== Ações de publicação ===== */}
          <Card className="space-y-3">
            <h3 className="font-semibold">Publicação</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => copy(fullCaption, "Legenda completa")}
                icon={<ClipboardCopy className="size-4" />}
              >
                Copiar legenda + tags
              </Button>
              <Button
                variant="outline"
                onClick={() => copy(post.hashtags.map((h) => `#${h}`).join(" "), "Hashtags")}
                icon={<Hash className="size-4" />}
              >
                Copiar só hashtags
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Field label="Agendar para">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </Field>
              </div>
              <Button
                variant="outline"
                onClick={schedule}
                loading={pending}
                icon={<CalendarClock className="size-4" />}
              >
                Agendar
              </Button>
            </div>

            {post.status !== "publicado" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={publish} loading={pending} icon={<Send className="size-4" />}>
                  Preparar para postar
                </Button>
                <Button
                  variant="outline"
                  onClick={markPublished}
                  loading={pending}
                  icon={<Check className="size-4" />}
                >
                  Marcar como publicado
                </Button>
              </div>
            )}

            <Button variant="danger" onClick={remove} icon={<Trash2 className="size-4" />}>
              Excluir post
            </Button>
          </Card>

          {/* ===== Métricas ===== */}
          {post.status === "publicado" && (
            <Card className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <BarChart3 className="size-4 text-insta-orange" /> Registrar métricas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    ["likes", "Curtidas"],
                    ["comments", "Comentários"],
                    ["saves", "Salvos"],
                    ["shares", "Compart."],
                    ["reach", "Alcance"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={m[key]}
                      onChange={(e) => setM((s) => ({ ...s, [key]: e.target.value }))}
                    />
                  </Field>
                ))}
              </div>
              <Button onClick={saveMetric} loading={pending} icon={<Save className="size-4" />}>
                Salvar métricas
              </Button>
              {metrics.length > 0 && (
                <p className="text-xs text-ink-dim">
                  Último registro: {formatDateShort(metrics[0].recordedAt)} —{" "}
                  {metrics[0].likes} curtidas, {metrics[0].comments} comentários,{" "}
                  {metrics[0].reach} de alcance
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
