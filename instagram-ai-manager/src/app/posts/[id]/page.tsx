import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Post, PostMetric } from "@/models";
import { serializeMetric, serializePost } from "@/lib/serialize";
import { PostDetail } from "@/components/posts/PostDetail";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const doc = await Post.findById(id).lean();
  if (!doc) notFound();
  const metrics = await PostMetric.find({ postId: id })
    .sort({ recordedAt: -1 })
    .limit(20)
    .lean();

  return (
    <PostDetail
      post={serializePost(doc)}
      metrics={metrics.map(serializeMetric)}
    />
  );
}
