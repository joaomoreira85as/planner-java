"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  Heart,
  LineChart as LineChartIcon,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { addFollowerSnapshot } from "@/actions/metrics";
import type {
  SerializedMetric,
  SerializedPost,
  SerializedSnapshot,
} from "@/lib/types";
import { Button, Card, EmptyState, Field, inputCls } from "@/components/ui";
import { formatDay } from "@/lib/format";

const TOOLTIP_STYLE = {
  backgroundColor: "#1c1c26",
  border: "1px solid #2a2a36",
  borderRadius: "12px",
  color: "#f4f4f8",
  fontSize: 12,
};

export function GrowthView({
  posts,
  metrics,
  snapshots,
}: {
  posts: SerializedPost[];
  metrics: SerializedMetric[];
  snapshots: SerializedSnapshot[];
}) {
  const router = useRouter();
  const [followers, setFollowers] = useState("");
  const [pending, startTransition] = useTransition();

  /* insights via streaming */
  const [insights, setInsights] = useState("");
  const [streaming, setStreaming] = useState(false);

  const followerData = useMemo(
    () =>
      snapshots.map((s) => ({
        dia: formatDay(s.recordedAt),
        seguidores: s.count,
      })),
    [snapshots]
  );

  const engagementData = useMemo(() => {
    const latestByPost = new Map<string, SerializedMetric>();
    for (const m of metrics) latestByPost.set(m.postId, m);
    return posts
      .map((p) => {
        const m = latestByPost.get(p.id);
        if (!m) return null;
        return {
          post: (p.theme ?? p.caption).slice(0, 18) + "…",
          curtidas: m.likes,
          comentários: m.comments,
          salvos: m.saves,
        };
      })
      .filter(Boolean)
      .slice(0, 10) as { post: string; curtidas: number; comentários: number; salvos: number }[];
  }, [posts, metrics]);

  const delta = useMemo(() => {
    if (snapshots.length < 2) return null;
    return snapshots[snapshots.length - 1].count - snapshots[0].count;
  }, [snapshots]);

  const saveFollowers = () =>
    startTransition(async () => {
      const n = Number(followers);
      if (!Number.isFinite(n) || n < 0) {
        toast.error("Número inválido");
        return;
      }
      const res = await addFollowerSnapshot(Math.round(n));
      if (res.ok) {
        toast.success("Registrado!");
        setFollowers("");
        router.refresh();
      } else toast.error(res.error ?? "Erro");
    });

  async function generateInsights() {
    setStreaming(true);
    setInsights("");
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao gerar insights");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setInsights((s) => s + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar insights");
    } finally {
      setStreaming(false);
    }
  }

  const current = snapshots.at(-1)?.count;

  return (
    <div className="space-y-4">
      {/* ===== registro rápido ===== */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field
              label="Seguidores hoje"
              hint="Abra seu perfil no Instagram e digite o número atual."
            >
              <input
                type="number"
                min={0}
                className={inputCls}
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder={current ? String(current) : "Ex.: 1250"}
              />
            </Field>
          </div>
          <Button onClick={saveFollowers} loading={pending} icon={<Plus className="size-4" />}>
            Registrar
          </Button>
        </div>
        {current !== undefined && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-dim">
            <UsersRound className="size-4 text-insta-pink" />
            Atual: <strong className="text-ink">{current.toLocaleString("pt-BR")}</strong>
            {delta !== null && (
              <span className={delta >= 0 ? "text-insta-yellow" : "text-insta-red"}>
                ({delta >= 0 ? "+" : ""}
                {delta.toLocaleString("pt-BR")} no período)
              </span>
            )}
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ===== gráfico de seguidores ===== */}
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <LineChartIcon className="size-4 text-insta-purple" /> Evolução de seguidores
          </h3>
          {followerData.length < 2 ? (
            <EmptyState
              icon={<UsersRound className="size-6" />}
              title="Registre pelo menos 2 medições"
              hint="Anote seus seguidores algumas vezes por semana para ver a curva."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerData}>
                  <CartesianGrid stroke="#2a2a36" strokeDasharray="3 3" />
                  <XAxis dataKey="dia" stroke="#9c9cae" fontSize={11} />
                  <YAxis stroke="#9c9cae" fontSize={11} width={44} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="seguidores"
                    stroke="#e1306c"
                    strokeWidth={2.5}
                    dot={{ fill: "#fcb045", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ===== engajamento por post ===== */}
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <BarChart3 className="size-4 text-insta-orange" /> Engajamento por post
          </h3>
          {engagementData.length === 0 ? (
            <EmptyState
              icon={<Heart className="size-6" />}
              title="Sem métricas ainda"
              hint="Depois de publicar, registre curtidas e comentários na página do post."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid stroke="#2a2a36" strokeDasharray="3 3" />
                  <XAxis dataKey="post" stroke="#9c9cae" fontSize={10} />
                  <YAxis stroke="#9c9cae" fontSize={11} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#2a2a3644" }} />
                  <Bar dataKey="curtidas" fill="#e1306c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comentários" fill="#833ab4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salvos" fill="#fcb045" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ===== insights com IA ===== */}
      <Card className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-insta-yellow" /> Insights com IA
          </h3>
          <Button onClick={generateInsights} loading={streaming} icon={<Sparkles className="size-4" />}>
            {streaming ? "Analisando…" : "Gerar insights"}
          </Button>
        </div>
        {insights ? (
          <div className="whitespace-pre-wrap rounded-xl border border-edge bg-surface-2 p-4 text-sm leading-relaxed max-h-[32rem] overflow-y-auto">
            {insights}
            {streaming && <span className="animate-pulse">▍</span>}
          </div>
        ) : (
          <p className="text-sm text-ink-dim">
            A IA analisa seus posts, métricas e seguidores e diz o que está
            funcionando, o que melhorar e o que postar nas próximas 2 semanas.
          </p>
        )}
      </Card>
    </div>
  );
}
