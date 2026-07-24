import Link from "next/link";
import { Images, Plus, Sparkles } from "lucide-react";
import { getSupabase, type PostRow } from "@/lib/supabase";
import { serializePost } from "@/lib/serialize";
import { Button, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import type { SerializedPost } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<SerializedPost[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("posts")
      .select()
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<PostRow[]>();
    return (data ?? []).map(serializePost);
  } catch {
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <PageHeader
        icon={<Images className="size-5" />}
        title="Posts"
        subtitle={`${posts.length} post${posts.length === 1 ? "" : "s"} no total`}
        actions={
          <Link href="/gerar">
            <Button icon={<Plus className="size-4" />}>Novo post com IA</Button>
          </Link>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={<Images className="size-6" />}
          title="Nenhum post ainda"
          hint="Gere seu primeiro post com IA: legenda, hashtags e imagem em segundos."
          action={
            <Link href="/gerar">
              <Button icon={<Sparkles className="size-4" />}>Gerar post com IA</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-insta-pink/40">
                <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl border border-edge bg-surface-2 grid place-items-center">
                  {post.imageFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/images/${post.imageFile}`}
                      alt=""
                      className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Images className="size-8 text-ink-dim" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={post.status} />
                  <span className="text-[11px] text-ink-dim whitespace-nowrap">
                    {post.scheduledAt
                      ? `📅 ${formatDateShort(post.scheduledAt)}`
                      : formatDateShort(post.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-ink-dim line-clamp-3 whitespace-pre-wrap">
                  {post.caption}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
