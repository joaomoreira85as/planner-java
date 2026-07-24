"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import type { ActionResult } from "@/lib/types";

export async function addIdea(title: string, notes = ""): Promise<ActionResult> {
  const parsed = z.string().min(1).max(300).safeParse(title.trim());
  if (!parsed.success) return { ok: false, error: "Título inválido" };
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("content_ideas")
      .insert({ title: parsed.data, notes: notes.slice(0, 2000) });
    if (error) throw error;
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao salvar a ideia" };
  }
}

export async function toggleIdea(id: string, used: boolean): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    await supabase.from("content_ideas").update({ used }).eq("id", id);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao atualizar a ideia" };
  }
}

export async function deleteIdea(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    await supabase.from("content_ideas").delete().eq("id", id);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao excluir a ideia" };
  }
}
