"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Post, POST_STATUSES } from "@/models";
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

export async function createPost(
  input: PostInput
): Promise<ActionResult<SerializedPost>> {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    await dbConnect();
    const { scheduledAt, ...rest } = parsed.data;
    const doc = await Post.create({
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "agendado" : "rascunho",
    });
    revalidateAll();
    return { ok: true, data: serializePost(doc.toObject()) };
  } catch {
    return { ok: false, error: "Falha ao salvar o post. O MongoDB está acessível?" };
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
    await dbConnect();
    const { scheduledAt, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (scheduledAt !== undefined) {
      update.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }
    const doc = await Post.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return { ok: false, error: "Post não encontrado" };
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(doc) };
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
    await dbConnect();
    const update: Record<string, unknown> = { status: parsed.data };
    if (parsed.data === "publicado") update.publishedAt = new Date();
    const doc = await Post.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return { ok: false, error: "Post não encontrado" };
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(doc) };
  } catch {
    return { ok: false, error: "Falha ao mudar o status" };
  }
}

/** Envia o post pelo publisher ativo (hoje: fluxo manual → status "pronto"). */
export async function publishPost(id: string): Promise<ActionResult<SerializedPost>> {
  try {
    await dbConnect();
    const doc = await Post.findById(id);
    if (!doc) return { ok: false, error: "Post não encontrado" };
    const publisher = getPublisher();
    const result = await publisher.publish(String(doc._id));
    if (!result.ok) return { ok: false, error: result.error };
    const fresh = await Post.findById(id).lean();
    revalidateAll();
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: serializePost(fresh) };
  } catch {
    return { ok: false, error: "Falha ao publicar" };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Post.findByIdAndDelete(id);
    revalidateAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao excluir o post" };
  }
}
