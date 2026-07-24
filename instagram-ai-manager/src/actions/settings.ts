"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { BrandProfile } from "@/models";
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
    await dbConnect();
    const doc = await BrandProfile.findOne({ key: "default" }).lean();
    return serializeBrand(doc);
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
    await dbConnect();
    await BrandProfile.findOneAndUpdate({ key: "default" }, parsed.data, {
      upsert: true,
      new: true,
    });
    revalidatePath("/configuracoes");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao salvar. O MongoDB está acessível?" };
  }
}
