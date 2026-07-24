import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Post } from "@/models";
import { getPublisher } from "@/lib/publisher";

/**
 * Gatilho de publicação agendada. Protegido por CRON_SECRET.
 *
 * Hoje (fluxo manual): promove posts "agendado" vencidos para "pronto",
 * formando a fila "Pronto para postar".
 * Futuro (Graph API configurada): publica automaticamente no Instagram.
 *
 * Agende com Vercel Cron (vercel.json) ou um cron/node-cron chamando:
 *   GET /api/cron/publish  com header  Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await dbConnect();
    const due = await Post.find({
      status: "agendado",
      scheduledAt: { $lte: new Date() },
    }).lean();

    const publisher = getPublisher();
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const post of due) {
      const r = await publisher.publish(String(post._id));
      results.push({ id: String(post._id), ok: r.ok, error: r.error });
    }

    return NextResponse.json({ publisher: publisher.id, processed: results });
  } catch {
    return NextResponse.json(
      { error: "Banco de dados indisponível. Verifique MONGODB_URI." },
      { status: 503 }
    );
  }
}
