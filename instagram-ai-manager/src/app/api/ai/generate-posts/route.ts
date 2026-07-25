import { NextResponse } from "next/server";
import { AiConfigError, generatePostOptions } from "@/lib/ai/claude";
import { generateBriefZod } from "@/lib/ai/schemas";
import { getBrandProfile } from "@/actions/settings";

export const maxDuration = 300;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = generateBriefZod.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const brand = await getBrandProfile();
    const options = await generatePostOptions(parsed.data, brand);
    return NextResponse.json({ options });
  } catch (err) {
    const status = err instanceof AiConfigError ? 422 : 502;
    const message =
      err instanceof Error ? err.message : "Falha ao gerar posts com a IA";
    return NextResponse.json({ error: message }, { status });
  }
}
