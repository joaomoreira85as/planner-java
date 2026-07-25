import type {
  BrandProfileRow,
  ContentIdeaRow,
  FollowerSnapshotRow,
  PostMetricRow,
  PostRow,
} from "./supabase-types";
import type {
  SerializedBrandProfile,
  SerializedIdea,
  SerializedMetric,
  SerializedPost,
  SerializedSnapshot,
} from "./types";

/* Converte linhas do Postgres (snake_case) em objetos camelCase para a UI. */

export function serializePost(row: PostRow): SerializedPost {
  return {
    id: row.id,
    caption: row.caption,
    hashtags: row.hashtags ?? [],
    imagePrompt: row.image_prompt,
    imageFile: row.image_file,
    status: row.status,
    theme: row.theme,
    rationale: row.rationale,
    suggestedTime: row.suggested_time,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeBrand(row: BrandProfileRow | null): SerializedBrandProfile {
  return {
    brandName: row?.brand_name ?? "",
    niche: row?.niche ?? "",
    toneOfVoice: row?.tone_of_voice ?? "",
    targetAudience: row?.target_audience ?? "",
    postingFrequency: row?.posting_frequency ?? "3x por semana",
    extraContext: row?.extra_context ?? "",
  };
}

export function serializeMetric(row: PostMetricRow): SerializedMetric {
  return {
    id: row.id,
    postId: row.post_id,
    likes: row.likes,
    comments: row.comments,
    saves: row.saves,
    shares: row.shares,
    reach: row.reach,
    recordedAt: row.recorded_at,
  };
}

export function serializeSnapshot(row: FollowerSnapshotRow): SerializedSnapshot {
  return {
    id: row.id,
    count: row.count,
    recordedAt: row.recorded_at,
  };
}

export function serializeIdea(row: ContentIdeaRow): SerializedIdea {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    used: row.used,
    createdAt: row.created_at,
  };
}
