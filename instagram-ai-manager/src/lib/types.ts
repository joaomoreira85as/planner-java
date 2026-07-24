/** Tipos serializados (plain objects) trocados entre server e client components. */

import type { PostStatus } from "@/models";

export type { PostStatus };

export interface SerializedPost {
  id: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string | null;
  imageFile: string | null;
  status: PostStatus;
  theme: string | null;
  rationale: string | null;
  suggestedTime: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedBrandProfile {
  brandName: string;
  niche: string;
  toneOfVoice: string;
  targetAudience: string;
  postingFrequency: string;
  extraContext: string;
}

export interface SerializedMetric {
  id: string;
  postId: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  recordedAt: string;
}

export interface SerializedSnapshot {
  id: string;
  count: number;
  recordedAt: string;
}

export interface SerializedIdea {
  id: string;
  title: string;
  notes: string;
  used: boolean;
  createdAt: string;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}
