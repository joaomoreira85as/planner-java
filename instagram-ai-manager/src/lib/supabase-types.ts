/** Tipos das linhas do Postgres (snake_case) — sem dependências de servidor. */

export const POST_STATUSES = ["rascunho", "agendado", "pronto", "publicado"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export interface PostRow {
  id: string;
  caption: string;
  hashtags: string[];
  image_prompt: string | null;
  image_file: string | null;
  status: PostStatus;
  theme: string | null;
  rationale: string | null;
  suggested_time: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandProfileRow {
  key: string;
  brand_name: string;
  niche: string;
  tone_of_voice: string;
  target_audience: string;
  posting_frequency: string;
  extra_context: string;
}

export interface PostMetricRow {
  id: string;
  post_id: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  recorded_at: string;
}

export interface FollowerSnapshotRow {
  id: string;
  count: number;
  recorded_at: string;
}

export interface ContentIdeaRow {
  id: string;
  title: string;
  notes: string;
  used: boolean;
  created_at: string;
}
