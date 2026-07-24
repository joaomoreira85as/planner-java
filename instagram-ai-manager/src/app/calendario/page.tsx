import { CalendarDays } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Post } from "@/models";
import { serializePost } from "@/lib/serialize";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/calendar/CalendarView";
import type { SerializedPost } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<SerializedPost[]> {
  try {
    await dbConnect();
    const docs = await Post.find({
      $or: [{ scheduledAt: { $ne: null } }, { publishedAt: { $ne: null } }],
    })
      .sort({ scheduledAt: 1 })
      .limit(300)
      .lean();
    return docs.map(serializePost);
  } catch {
    return [];
  }
}

export default async function CalendarioPage() {
  const posts = await getPosts();
  return (
    <div>
      <PageHeader
        icon={<CalendarDays className="size-5" />}
        title="Calendário"
        subtitle="Seus posts agendados e publicados, mês a mês"
      />
      <CalendarView posts={posts} />
    </div>
  );
}
