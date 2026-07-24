"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import type { ActionResult } from "@/lib/types";

const metricSchema = z.object({
  postId: z.string().min(1),
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  saves: z.number().int().min(0),
  shares: z.number().int().min(0),
  reach: z.number().int().min(0),
});

export async function addPostMetric(
  input: z.infer<typeof metricSchema>
): Promise<ActionResult> {
  const parsed = metricSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Valores de métrica inválidos" };
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("post_metrics").insert({
      post_id: parsed.data.postId,
      likes: parsed.data.likes,
      comments: parsed.data.comments,
      saves: parsed.data.saves,
      shares: parsed.data.shares,
      reach: parsed.data.reach,
    });
    if (error) throw error;
    revalidatePath("/crescimento");
    revalidatePath(`/posts/${parsed.data.postId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao registrar métricas" };
  }
}

export async function addFollowerSnapshot(count: number): Promise<ActionResult> {
  const parsed = z.number().int().min(0).safeParse(count);
  if (!parsed.success) return { ok: false, error: "Número de seguidores inválido" };
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("follower_snapshots")
      .insert({ count: parsed.data });
    if (error) throw error;
    revalidatePath("/crescimento");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao registrar seguidores" };
  }
}
