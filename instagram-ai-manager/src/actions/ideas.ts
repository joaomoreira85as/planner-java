"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { ContentIdea } from "@/models";
import type { ActionResult } from "@/lib/types";

export async function addIdea(title: string, notes = ""): Promise<ActionResult> {
  const parsed = z.string().min(1).max(300).safeParse(title.trim());
  if (!parsed.success) return { ok: false, error: "Título inválido" };
  try {
    await dbConnect();
    await ContentIdea.create({ title: parsed.data, notes: notes.slice(0, 2000) });
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao salvar a ideia" };
  }
}

export async function toggleIdea(id: string, used: boolean): Promise<ActionResult> {
  try {
    await dbConnect();
    await ContentIdea.findByIdAndUpdate(id, { used });
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao atualizar a ideia" };
  }
}

export async function deleteIdea(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await ContentIdea.findByIdAndDelete(id);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao excluir a ideia" };
  }
}
