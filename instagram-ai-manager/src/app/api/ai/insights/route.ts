import { NextResponse } from "next/server";
import {
  getSupabase,
  type FollowerSnapshotRow,
  type PostMetricRow,
  type PostRow,
} from "@/lib/supabase";
import { AiConfigError, streamInsights } from "@/lib/ai/claude";
import { getBrandProfile } from "@/actions/settings";

export const maxDuration = 300;

export async function POST() {
  try {
    const supabase = getSupabase();
    const [brand, postsRes, metricsRes, followersRes] = await Promise.all([
      getBrandProfile(),
      supabase
        .from("posts")
        .select()
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<PostRow[]>(),
      supabase
        .from("post_metrics")
        .select()
        .order("recorded_at", { ascending: false })
        .limit(200)
        .returns<PostMetricRow[]>(),
      supabase
        .from("follower_snapshots")
        .select()
        .order("recorded_at", { ascending: true })
        .limit(200)
        .returns<FollowerSnapshotRow[]>(),
    ]);

    const posts = postsRes.data ?? [];
    const metrics = metricsRes.data ?? [];
    const followers = followersRes.data ?? [];

    const metricsByPost = new Map<string, PostMetricRow[]>();
    for (const m of metrics) {
      if (!metricsByPost.has(m.post_id)) metricsByPost.set(m.post_id, []);
      metricsByPost.get(m.post_id)!.push(m);
    }

    const payload = {
      followers: followers.map((f) => ({
        count: f.count,
        recordedAt: f.recorded_at,
      })),
      posts: posts.map((p) => ({
        caption: p.caption.slice(0, 300),
        theme: p.theme,
        status: p.status as string,
        publishedAt: p.published_at,
        hashtags: (p.hashtags ?? []).slice(0, 10),
        metrics: (metricsByPost.get(p.id) ?? []).map((m) => ({
          likes: m.likes,
          comments: m.comments,
          saves: m.saves,
          shares: m.shares,
          reach: m.reach,
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
