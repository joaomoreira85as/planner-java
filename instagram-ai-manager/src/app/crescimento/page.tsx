import { TrendingUp } from "lucide-react";
import {
  getSupabase,
  type FollowerSnapshotRow,
  type PostMetricRow,
  type PostRow,
} from "@/lib/supabase";
import { serializeMetric, serializePost, serializeSnapshot } from "@/lib/serialize";
import { PageHeader } from "@/components/ui";
import { GrowthView } from "@/components/growth/GrowthView";

export const dynamic = "force-dynamic";

export default async function CrescimentoPage() {
  let posts: ReturnType<typeof serializePost>[] = [];
  let metrics: ReturnType<typeof serializeMetric>[] = [];
  let snapshots: ReturnType<typeof serializeSnapshot>[] = [];
  try {
    const supabase = getSupabase();
    const [p, m, s] = await Promise.all([
      supabase
        .from("posts")
        .select()
        .eq("status", "publicado")
        .order("published_at", { ascending: false })
        .limit(50)
        .returns<PostRow[]>(),
      supabase
        .from("post_metrics")
        .select()
        .order("recorded_at", { ascending: true })
        .limit(300)
        .returns<PostMetricRow[]>(),
      supabase
        .from("follower_snapshots")
        .select()
        .order("recorded_at", { ascending: true })
        .limit(200)
        .returns<FollowerSnapshotRow[]>(),
    ]);
    posts = (p.data ?? []).map(serializePost);
    metrics = (m.data ?? []).map(serializeMetric);
    snapshots = (s.data ?? []).map(serializeSnapshot);
  } catch {
    // sem banco: a página renderiza vazia com instruções
  }

  return (
    <div>
      <PageHeader
        icon={<TrendingUp className="size-5" />}
        title="Crescimento"
        subtitle="Registre seus números e deixe a IA encontrar o que funciona"
      />
      <GrowthView posts={posts} metrics={metrics} snapshots={snapshots} />
    </div>
  );
}
