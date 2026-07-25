import { CalendarDays } from "lucide-react";
import { getSupabase, type PostRow } from "@/lib/supabase";
import { serializePost } from "@/lib/serialize";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/calendar/CalendarView";
import type { SerializedPost } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<SerializedPost[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("posts")
      .select()
      .or("scheduled_at.not.is.null,published_at.not.is.null")
      .order("scheduled_at", { ascending: true })
      .limit(300)
      .returns<PostRow[]>();
    return (data ?? []).map(serializePost);
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
