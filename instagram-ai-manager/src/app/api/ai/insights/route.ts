import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { FollowerSnapshot, Post, PostMetric } from "@/models";
import { AiConfigError, streamInsights } from "@/lib/ai/claude";
import { getBrandProfile } from "@/actions/settings";

export const maxDuration = 300;

export async function POST() {
  try {
    await dbConnect();
    const [brand, posts, metrics, followers] = await Promise.all([
      getBrandProfile(),
      Post.find().sort({ createdAt: -1 }).limit(50).lean(),
      PostMetric.find().sort({ recordedAt: -1 }).limit(200).lean(),
      FollowerSnapshot.find().sort({ recordedAt: 1 }).limit(200).lean(),
    ]);

    const metricsByPost = new Map<string, typeof metrics>();
    for (const m of metrics) {
      const key = String(m.postId);
      if (!metricsByPost.has(key)) metricsByPost.set(key, []);
      metricsByPost.get(key)!.push(m);
    }

    const payload = {
      followers: followers.map((f) => ({
        count: f.count,
        recordedAt: new Date(f.recordedAt!).toISOString(),
      })),
      posts: posts.map((p) => ({
        caption: p.caption.slice(0, 300),
        theme: p.theme ?? null,
        status: p.status as string,
        publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
        hashtags: (p.hashtags ?? []).slice(0, 10),
        metrics: (metricsByPost.get(String(p._id)) ?? []).map((m) => ({
          likes: m.likes ?? 0,
          comments: m.comments ?? 0,
          saves: m.saves ?? 0,
          shares: m.shares ?? 0,
          reach: m.reach ?? 0,
        })),
      })),
    };

    const stream = streamInsights(payload, brand);
    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });
        stream.on("error", (err) => {
          controller.enqueue(
            encoder.encode(`\n\n**Erro:** ${err.message ?? "falha na geração"}`)
          );
          controller.close();
        });
        stream.on("end", () => controller.close());
      },
      cancel() {
        stream.abort();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const status = err instanceof AiConfigError ? 422 : 500;
    const message = err instanceof Error ? err.message : "Falha ao gerar insights";
    return NextResponse.json({ error: message }, { status });
  }
}
