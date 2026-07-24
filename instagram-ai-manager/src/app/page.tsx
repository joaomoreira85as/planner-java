import Link from "next/link";
import {
  CalendarDays,
  Flame,
  Images,
  LayoutDashboard,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { dbConnect } from "@/lib/db";
import { ContentIdea, FollowerSnapshot, Post } from "@/models";
import { serializeIdea, serializePost, serializeSnapshot } from "@/lib/serialize";
import { Button, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { IdeasList } from "@/components/dashboard/IdeasList";
import { formatDateShort } from "@/lib/format";
import type { SerializedIdea, SerializedPost, SerializedSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getData() {
  const empty = {
    upcoming: [] as SerializedPost[],
    ready: [] as SerializedPost[],
    monthCount: 0,
    snapshots: [] as SerializedSnapshot[],
    ideas: [] as SerializedIdea[],
    dbOk: false,
  };
  try {
    await dbConnect();
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400_000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [upcoming, ready, monthCount, snapshots, ideas] = await Promise.all([
      Post.find({ status: "agendado", scheduledAt: { $gte: now, $lte: in7 } })
        .sort({ scheduledAt: 1 })
        .limit(6)
        .lean(),
      Post.find({ status: "pronto" }).sort({ updatedAt: -1 }).limit(6).lean(),
      Post.countDocuments({
        $or: [
          { publishedAt: { $gte: monthStart } },
          { scheduledAt: { $gte: monthStart, $lte: now } },
        ],
      }),
      FollowerSnapshot.find().sort({ recordedAt: 1 }).limit(100).lean(),
      ContentIdea.find({ used: false }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    return {
      upcoming: upcoming.map(serializePost),
      ready: ready.map(serializePost),
      monthCount,
      snapshots: snapshots.map(serializeSnapshot),
      ideas: ideas.map(serializeIdea),
      dbOk: true,
    };
  } catch {
    return empty;
  }
}

export default async function DashboardPage() {
  const { upcoming, ready, monthCount, snapshots, ideas, dbOk } = await getData();
  const followers = snapshots.at(-1)?.count;
  const delta =
    snapshots.length >= 2
      ? snapshots[snapshots.length - 1].count - snapshots[0].count
      : null;

  const stats = [
    {
      icon: <UsersRound className="size-5" />,
      label: "Seguidores",
      value: followers?.toLocaleString("pt-BR") ?? "—",
      extra:
        delta !== null
          ? `${delta >= 0 ? "+" : ""}${delta.toLocaleString("pt-BR")} no período`
          : "registre em Crescimento",
    },
    {
      icon: <Images className="size-5" />,
      label: "Posts no mês",
      value: String(monthCount),
      extra: "publicados ou vencidos",
    },
    {
      icon: <Send className="size-5" />,
      label: "Prontos para postar",
      value: String(ready.length),
      extra: "aguardando você",
    },
    {
      icon: <Flame className="size-5" />,
      label: "Agendados (7 dias)",
      value: String(upcoming.length),
      extra: "próxima semana",
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<LayoutDashboard className="size-5" />}
        title="Dashboard"
        subtitle="Visão geral do seu Instagram"
        actions={
          <Link href="/gerar">
            <Button icon={<Sparkles className="size-4" />}>Gerar post com IA</Button>
          </Link>
        }
      />

      {!dbOk && (
        <Card className="mb-4 border-insta-red/40">
          <p className="text-sm">
            ⚠️ Não consegui conectar ao MongoDB. Confira a variável{" "}
            <code className="font-mono">MONGODB_URI</code> no arquivo{" "}
            <code className="font-mono">.env</code> e se o banco está no ar.
          </p>
        </Card>
      )}

      {/* ===== cards de estatísticas ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <span className="insta-gradient grid place-items-center size-9 rounded-xl text-white mb-3">
              {s.icon}
            </span>
            <p className="text-2xl font-bold leading-none">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-ink-dim">{s.label}</p>
            <p className="text-[11px] text-ink-dim/70">{s.extra}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ===== fila pronto para postar ===== */}
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Send className="size-4 text-insta-orange" /> Pronto para postar
          </h2>
          {ready.length === 0 ? (
            <p className="text-sm text-ink-dim">
              Nada por aqui. Quando um post agendado vencer (ou você clicar em
              &ldquo;Preparar para postar&rdquo;), ele aparece nesta fila.
            </p>
          ) : (
            <ul className="space-y-2">
              {ready.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex items-center gap-3 rounded-xl border border-edge bg-surface-2/60 p-2.5 hover:border-insta-orange/50 transition-colors"
                  >
                    <div className="grid place-items-center size-10 shrink-0 rounded-lg bg-surface overflow-hidden border border-edge">
                      {p.imageFile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/images/${p.imageFile}`} alt="" className="size-full object-cover" />
                      ) : (
                        <Images className="size-4 text-ink-dim" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {p.theme ?? p.caption}
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ===== próximos agendados ===== */}
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CalendarDays className="size-4 text-insta-purple" /> Próximos 7 dias
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-6" />}
              title="Nenhum post agendado"
              hint="Consistência é o que mais cresce perfil. Agende a próxima semana!"
              action={
                <Link href="/gerar">
                  <Button icon={<Sparkles className="size-4" />}>Gerar e agendar</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2">
              {upcoming.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex items-center gap-3 rounded-xl border border-edge bg-surface-2/60 p-2.5 hover:border-insta-purple/50 transition-colors"
                  >
                    <span className="text-xs font-bold text-insta-yellow whitespace-nowrap">
                      {formatDateShort(p.scheduledAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {p.theme ?? p.caption}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ===== ideias ===== */}
      <div className="mt-4">
        <IdeasList ideas={ideas} />
      </div>
    </div>
  );
}
