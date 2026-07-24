import { TrendingUp } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { FollowerSnapshot, Post, PostMetric } from "@/models";
import { serializeMetric, serializePost, serializeSnapshot } from "@/lib/serialize";
import { PageHeader } from "@/components/ui";
import { GrowthView } from "@/components/growth/GrowthView";

export const dynamic = "force-dynamic";

export default async function CrescimentoPage() {
  let posts: ReturnType<typeof serializePost>[] = [];
  let metrics: ReturnType<typeof serializeMetric>[] = [];
  let snapshots: ReturnType<typeof serializeSnapshot>[] = [];
  try {
    await dbConnect();
    const [p, m, s] = await Promise.all([
      Post.find({ status: "publicado" }).sort({ publishedAt: -1 }).limit(50).lean(),
      PostMetric.find().sort({ recordedAt: 1 }).limit(300).lean(),
      FollowerSnapshot.find().sort({ recordedAt: 1 }).limit(200).lean(),
    ]);
    posts = p.map(serializePost);
    metrics = m.map(serializeMetric);
    snapshots = s.map(serializeSnapshot);
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
