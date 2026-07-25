"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Lightbulb, Plus, Sparkles, Trash2 } from "lucide-react";
import { addIdea, deleteIdea, toggleIdea } from "@/actions/ideas";
import type { SerializedIdea } from "@/lib/types";
import { Button, Card, inputCls } from "@/components/ui";

export function IdeasList({ ideas }: { ideas: SerializedIdea[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  const add = () =>
    startTransition(async () => {
      if (title.trim().length < 2) return;
      const res = await addIdea(title);
      if (res.ok) {
        setTitle("");
        router.refresh();
      } else toast.error(res.error ?? "Erro");
    });

  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Lightbulb className="size-4 text-insta-yellow" /> Banco de ideias
      </h2>
      <div className="flex gap-2 mb-3">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Anote uma ideia de post…"
        />
        <Button onClick={add} loading={pending} icon={<Plus className="size-4" />} aria-label="Adicionar ideia" />
      </div>
      {ideas.length === 0 ? (
        <p className="text-sm text-ink-dim">
          Guarde aqui temas para transformar em posts depois.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="flex items-center gap-2 rounded-xl border border-edge bg-surface-2/60 px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-sm">{idea.title}</span>
              <Link href={`/gerar?tema=${encodeURIComponent(idea.title)}`} title="Gerar post desta ideia">
                <Button variant="ghost" className="!min-h-9 !px-2" icon={<Sparkles className="size-4 text-insta-pink" />} />
              </Link>
              <Button
                variant="ghost"
                className="!min-h-9 !px-2"
                title="Marcar como usada"
                onClick={() =>
                  startTransition(async () => {
                    await toggleIdea(idea.id, true);
                    router.refresh();
                  })
                }
                icon={<Check className="size-4" />}
              />
              <Button
                variant="ghost"
                className="!min-h-9 !px-2"
                title="Excluir"
                onClick={() =>
                  startTransition(async () => {
                    await deleteIdea(idea.id);
                    router.refresh();
                  })
                }
                icon={<Trash2 className="size-4 text-insta-red" />}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
