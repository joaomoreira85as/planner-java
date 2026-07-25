import { notFound } from "next/navigation";
import { getSupabase, type PostMetricRow, type PostRow } from "@/lib/supabase";
import { serializeMetric, serializePost } from "@/lib/serialize";
import { PostDetail } from "@/components/posts/PostDetail";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = getSupabase();
  const { data: post } = await supabase
    .from("posts")
    .select()
    .eq("id", id)
    .maybeSingle<PostRow>();
  if (!post) notFound();

  const { data: metrics } = await supabase
    .from("post_metrics")
    .select()
    .eq("post_id", id)
    .order("recorded_at", { ascending: false })
    .limit(20)
    .returns<PostMetricRow[]>();

  return (
    <PostDetail
      post={serializePost(post)}
      metrics={(metrics ?? []).map(serializeMetric)}
    />
  );
}
