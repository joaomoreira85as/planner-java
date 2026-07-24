import type {
  SerializedBrandProfile,
  SerializedIdea,
  SerializedMetric,
  SerializedPost,
  SerializedSnapshot,
} from "./types";

/* Converte documentos Mongoose (via .toObject()/lean) em objetos serializáveis. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = any;

const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);

export function serializePost(doc: AnyDoc): SerializedPost {
  return {
    id: String(doc._id),
    caption: doc.caption,
    hashtags: doc.hashtags ?? [],
    imagePrompt: doc.imagePrompt ?? null,
    imageFile: doc.imageFile ?? null,
    status: doc.status,
    theme: doc.theme ?? null,
    rationale: doc.rationale ?? null,
    suggestedTime: doc.suggestedTime ?? null,
    scheduledAt: iso(doc.scheduledAt),
    publishedAt: iso(doc.publishedAt),
    createdAt: iso(doc.createdAt)!,
    updatedAt: iso(doc.updatedAt)!,
  };
}

export function serializeBrand(doc: AnyDoc | null): SerializedBrandProfile {
  return {
    brandName: doc?.brandName ?? "",
    niche: doc?.niche ?? "",
    toneOfVoice: doc?.toneOfVoice ?? "",
    targetAudience: doc?.targetAudience ?? "",
    postingFrequency: doc?.postingFrequency ?? "3x por semana",
    extraContext: doc?.extraContext ?? "",
  };
}

export function serializeMetric(doc: AnyDoc): SerializedMetric {
  return {
    id: String(doc._id),
    postId: String(doc.postId),
    likes: doc.likes ?? 0,
    comments: doc.comments ?? 0,
    saves: doc.saves ?? 0,
    shares: doc.shares ?? 0,
    reach: doc.reach ?? 0,
    recordedAt: iso(doc.recordedAt)!,
  };
}

export function serializeSnapshot(doc: AnyDoc): SerializedSnapshot {
  return {
    id: String(doc._id),
    count: doc.count,
    recordedAt: iso(doc.recordedAt)!,
  };
}

export function serializeIdea(doc: AnyDoc): SerializedIdea {
  return {
    id: String(doc._id),
    title: doc.title,
    notes: doc.notes ?? "",
    used: doc.used ?? false,
    createdAt: iso(doc.createdAt)!,
  };
}
