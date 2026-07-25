import { NextResponse } from "next/server";
import { getSupabase, type PostRow } from "@/lib/supabase";
import { getPublisher } from "@/lib/publisher";

/**
 * Gatilho de publicação agendada. Protegido por CRON_SECRET.
 *
 * Hoje (fluxo manual): promove posts "agendado" vencidos para "pronto",
 * formando a fila "Pronto para postar".
 * Futuro (Graph API configurada): publica automaticamente no Instagram.
 *
 * Agende com Vercel Cron (vercel.json) ou um cron externo chamando:
 *   GET /api/cron/publish  com header  Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { data: due, error } = await supabase
      .from("posts")
      .select("id")
      .eq("status", "agendado")
      .lte("scheduled_at", new Date().toISOString())
      .returns<Pick<PostRow, "id">[]>();
    if (error) throw error;

    const publisher = getPublisher();
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const post of due ?? []) {
      const r = await publisher.publish(post.id);
      results.push({ id: post.id, ok: r.ok, error: r.error });
    }

    return NextResponse.json({ publisher: publisher.id, processed: results });
  } catch {
    return NextResponse.json(
      { error: "Banco de dados indisponível. Verifique SUPABASE_URL/SUPABASE_KEY." },
      { status: 503 }
    );
  }
}
