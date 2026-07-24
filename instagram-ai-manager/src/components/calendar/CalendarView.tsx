"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { SerializedPost } from "@/lib/types";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui";

const STATUS_DOT: Record<string, string> = {
  rascunho: "bg-ink-dim",
  agendado: "bg-insta-purple",
  pronto: "bg-insta-orange",
  publicado: "bg-insta-pink",
};

function postDate(p: SerializedPost): Date | null {
  const iso = p.scheduledAt ?? p.publishedAt;
  return iso ? new Date(iso) : null;
}

export function CalendarView({ posts }: { posts: SerializedPost[] }) {
  const [month, setMonth] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthPosts = useMemo(
    () =>
      posts.filter((p) => {
        const d = postDate(p);
        return d && isSameMonth(d, month);
      }),
    [posts, month]
  );

  const byDay = (day: Date) =>
    monthPosts.filter((p) => {
      const d = postDate(p);
      return d && isSameDay(d, day);
    });

  return (
    <div className="space-y-4">
      {/* navegação do mês */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          icon={<ChevronLeft className="size-4" />}
          aria-label="Mês anterior"
        />
        <h2 className="text-lg font-bold capitalize insta-gradient-text">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button
          variant="outline"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          icon={<ChevronRight className="size-4" />}
          aria-label="Próximo mês"
        />
      </div>

      {/* ===== grade (desktop/tablet) ===== */}
      <Card className="hidden sm:block p-2 sm:p-3">
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-ink-dim mb-1">
          {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayPosts = byDay(day);
            const inMonth = isSameMonth(day, month);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 rounded-lg border p-1.5 ${
                  inMonth ? "border-edge bg-surface-2/50" : "border-transparent opacity-35"
                } ${isToday(day) ? "insta-ring" : ""}`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isToday(day) ? "insta-gradient-text" : "text-ink-dim"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/posts/${p.id}`}
                      className="flex items-center gap-1.5 rounded-md bg-surface px-1.5 py-1 text-[11px] hover:bg-edge/60 transition-colors"
                      title={p.caption}
                    >
                      <span className={`size-1.5 rounded-full shrink-0 ${STATUS_DOT[p.status]}`} />
                      <span className="truncate">{p.theme ?? p.caption}</span>
                    </Link>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="block text-[10px] text-ink-dim px-1.5">
                      +{dayPosts.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ===== agenda (mobile) ===== */}
      <div className="sm:hidden space-y-2">
        {monthPosts.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="Nada agendado neste mês"
            hint="Gere um post com IA e agende uma data para vê-lo aqui."
          />
        ) : (
          monthPosts
            .sort((a, b) => (postDate(a)!.getTime() - postDate(b)!.getTime()))
            .map((p) => (
              <Link key={p.id} href={`/posts/${p.id}`}>
                <Card className="flex items-center gap-3 !p-3 mb-2 hover:border-insta-pink/40 transition-colors">
                  <div className="grid place-items-center size-12 shrink-0 rounded-xl border border-edge bg-surface-2 overflow-hidden">
                    {p.imageFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/images/${p.imageFile}`} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5 text-ink-dim" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold capitalize insta-gradient-text">
                      {format(postDate(p)!, "EEE, dd 'de' MMM · HH:mm", { locale: ptBR })}
                    </p>
                    <p className="truncate text-sm text-ink-dim">{p.theme ?? p.caption}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Card>
              </Link>
            ))
        )}
      </div>

      {/* legenda de status */}
      <div className="flex flex-wrap gap-3 text-[11px] text-ink-dim">
        {Object.entries({
          agendado: "Agendado",
          pronto: "Pronto para postar",
          publicado: "Publicado",
          rascunho: "Rascunho",
        }).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${STATUS_DOT[key]}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
