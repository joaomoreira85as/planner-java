"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabase, POST_STATUSES, type PostRow } from "@/lib/supabase";
import { serializePost } from "@/lib/serialize";
import type { ActionResult, SerializedPost } from "@/lib/types";
import { getPublisher } from "@/lib/publisher";

const postInputSchema = z.object({
  caption: z.string().min(1, "A legenda é obrigatória").max(3000),
  hashtags: z.array(z.string().min(1).max(100)).max(30),
  imagePrompt: z.string().max(4000).nullable().optional(),
  imageFile: z.string().max(300).nullable().optional(),
  theme: z.string().max(300).nullable().optional(),
  rationale: z.string().max(2000).nullable().optional(),
  suggestedTime: z.string().max(200).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export type PostInput = z.infer<typeof postInputSchema>;

function revalidateAll() {
  for (const p of ["/", "/posts", "/calendario", "/crescimento"]) revalidatePath(p);
}

/** Converte o input camelCase para as colunas snake_case do Postgres. */
function toRow(input: Partial<PostInput>) {
  const row: Record<string, unknown> = {};
  if (input.caption !== undefined) row.caption = input.caption;
  if (input.hashtags !== undefined) row.hashtags = input.hashtags;
  if (input.imagePrompt !== undefined) row.image_prompt = input.imagePrompt;
  if (input.imageFile !== undefined) row.image_file = input.imageFile;
  if (input.theme !== undefined) row.theme = input.theme;
  if (input.rationale !== undefined) row.rationale = input.rationale;
  if (input.suggestedTime !== undefined) row.suggested_time = input.suggestedTime;
  if (input.scheduledAt !== undefined) row.scheduled_at = input.scheduledAt;
  return row;
}

export async function createPost(
  input: PostInput
): Promise<ActionResult<SerializedPost>> {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...toRow(parsed.data),
        status: parsed.data.scheduledAt ? "agendado" : "rascunho",
      })
      .select()
      .single<PostRow>();
    if (error || !data) throw error;
    revalidateAll();
    return { ok: true, data: serializePost(data) };
  } catch {
    return { ok: false, error: "Falha ao salvar o post. O Supabase está acessível?" };
  }
}

export async function updatePost(
  id: string,
  input: Partial<PostInput>
): Promise<ActionResult<SerializedPost>> {
  const parsed = postInputSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("posts")
      .update(toRow(parsed.data))
      .eq("id", id)
      .select()
      .single<PostRow>();
    if (error || !data) return { ok: false, error: "Post não encontrado" };
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(data) };
  } catch {
    return { ok: false, error: "Falha ao atualizar o post" };
  }
}

const statusSchema = z.enum(POST_STATUSES);

export async function setPostStatus(
  id: string,
  status: string
): Promise<ActionResult<SerializedPost>> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Status inválido" };
  try {
    const supabase = getSupabase();
    const update: Record<string, unknown> = { status: parsed.data };
    if (parsed.data === "publicado") update.published_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("posts")
      .update(update)
      .eq("id", id)
      .select()
      .single<PostRow>();
    if (error || !data) return { ok: false, error: "Post não encontrado" };
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(data) };
  } catch {
    return { ok: false, error: "Falha ao mudar o status" };
  }
}

/** Envia o post pelo publisher ativo (hoje: fluxo manual → status "pronto"). */
export async function publishPost(id: string): Promise<ActionResult<SerializedPost>> {
  try {
    const publisher = getPublisher();
    const result = await publisher.publish(id);
    if (!result.ok) return { ok: false, error: result.error };
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select()
      .eq("id", id)
      .single<PostRow>();
    if (error || !data) return { ok: false, error: "Post não encontrado" };
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(data) };
  } catch {
    return { ok: false, error: "Falha ao publicar" };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    await supabase.from("posts").delete().eq("id", id);
    revalidateAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao excluir o post" };
  }
}
