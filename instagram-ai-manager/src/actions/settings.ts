"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabase, type BrandProfileRow } from "@/lib/supabase";
import { serializeBrand } from "@/lib/serialize";
import type { ActionResult, SerializedBrandProfile } from "@/lib/types";

const brandSchema = z.object({
  brandName: z.string().max(120),
  niche: z.string().max(200),
  toneOfVoice: z.string().max(300),
  targetAudience: z.string().max(400),
  postingFrequency: z.string().max(100),
  extraContext: z.string().max(2000),
});

export async function getBrandProfile(): Promise<SerializedBrandProfile> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brand_profiles")
      .select()
      .eq("key", "default")
      .maybeSingle<BrandProfileRow>();
    return serializeBrand(data ?? null);
  } catch {
    return serializeBrand(null);
  }
}

export async function saveBrandProfile(
  input: SerializedBrandProfile
): Promise<ActionResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("brand_profiles").upsert({
      key: "default",
      brand_name: parsed.data.brandName,
      niche: parsed.data.niche,
      tone_of_voice: parsed.data.toneOfVoice,
      target_audience: parsed.data.targetAudience,
      posting_frequency: parsed.data.postingFrequency,
      extra_context: parsed.data.extraContext,
    });
    if (error) throw error;
    revalidatePath("/configuracoes");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao salvar. O Supabase está acessível?" };
  }
}
