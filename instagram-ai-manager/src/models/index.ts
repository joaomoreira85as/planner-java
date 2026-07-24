import mongoose, { Schema, type Model, type Types } from "mongoose";

/* Interfaces explícitas (InferSchemaType explode a checagem de tipos do TS) */

export const POST_STATUSES = ["rascunho", "agendado", "pronto", "publicado"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export interface BrandProfileDoc {
  _id: Types.ObjectId;
  key: string;
  brandName: string;
  niche: string;
  toneOfVoice: string;
  targetAudience: string;
  postingFrequency: string;
  extraContext: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDoc {
  _id: Types.ObjectId;
  caption: string;
  hashtags: string[];
  imagePrompt: string | null;
  imageFile: string | null;
  status: PostStatus;
  theme: string | null;
  rationale: string | null;
  suggestedTime: string | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMetricDoc {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  recordedAt: Date;
}

export interface FollowerSnapshotDoc {
  _id: Types.ObjectId;
  count: number;
  recordedAt: Date;
}

export interface ContentIdeaDoc {
  _id: Types.ObjectId;
  title: string;
  notes: string;
  used: boolean;
  createdAt: Date;
}

/* ===== Schemas ===== */

const brandProfileSchema = new Schema<BrandProfileDoc>(
  {
    key: { type: String, default: "default", unique: true },
    brandName: { type: String, default: "" },
    niche: { type: String, default: "" },
    toneOfVoice: { type: String, default: "" },
    targetAudience: { type: String, default: "" },
    postingFrequency: { type: String, default: "3x por semana" },
    extraContext: { type: String, default: "" },
  },
  { timestamps: true }
);

const postSchema = new Schema<PostDoc>(
  {
    caption: { type: String, required: true },
    hashtags: { type: [String], default: [] },
    imagePrompt: { type: String, default: null },
    imageFile: { type: String, default: null },
    status: { type: String, enum: POST_STATUSES, default: "rascunho" },
    theme: { type: String, default: null },
    rationale: { type: String, default: null },
    suggestedTime: { type: String, default: null },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
postSchema.index({ status: 1, scheduledAt: 1 });

const postMetricSchema = new Schema<PostMetricDoc>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const followerSnapshotSchema = new Schema<FollowerSnapshotDoc>(
  {
    count: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const contentIdeaSchema = new Schema<ContentIdeaDoc>(
  {
    title: { type: String, required: true },
    notes: { type: String, default: "" },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ===== Registro dos modelos (seguro para hot-reload) =====
 * Obs.: registrar inline com o schema tipado — passar Schema<T> por um helper
 * com parâmetro `Schema` sem genérico explode a checagem de tipos do TS. */

export const BrandProfile =
  (mongoose.models.BrandProfile as Model<BrandProfileDoc>) ??
  mongoose.model<BrandProfileDoc>("BrandProfile", brandProfileSchema);

export const Post =
  (mongoose.models.Post as Model<PostDoc>) ??
  mongoose.model<PostDoc>("Post", postSchema);

export const PostMetric =
  (mongoose.models.PostMetric as Model<PostMetricDoc>) ??
  mongoose.model<PostMetricDoc>("PostMetric", postMetricSchema);

export const FollowerSnapshot =
  (mongoose.models.FollowerSnapshot as Model<FollowerSnapshotDoc>) ??
  mongoose.model<FollowerSnapshotDoc>("FollowerSnapshot", followerSnapshotSchema);

export const ContentIdea =
  (mongoose.models.ContentIdea as Model<ContentIdeaDoc>) ??
  mongoose.model<ContentIdeaDoc>("ContentIdea", contentIdeaSchema);
