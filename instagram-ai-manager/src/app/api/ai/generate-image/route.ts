import { NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, ImageConfigError } from "@/lib/ai/openai-image";

export const maxDuration = 300;

const bodySchema = z.object({
  prompt: z.string().min(3).max(4000),
  ref: z.string().max(60).optional().default("post"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Prompt de imagem inválido" }, { status: 400 });
  }

  try {
    const filename = await generateImage(parsed.data.prompt, parsed.data.ref);
    return NextResponse.json({ filename, url: `/api/images/${filename}` });
  } catch (err) {
    const status = err instanceof ImageConfigError ? 422 : 502;
    const message =
      err instanceof Error ? err.message : "Falha ao gerar a imagem";
    return NextResponse.json({ error: message }, { status });
  }
}
