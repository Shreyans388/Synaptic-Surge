import { Schema, model } from "mongoose";

export interface IPost {
  _id: string;
  batch_id: string;
  user_id: string;
  brandId: string;
  topic?: string;
  tone?: string;
  post_details?: string;
  context?: string;
  image_preference?: string;
  image_prompt?: string;
  reference_image_url?: string;

  content: string;
  image_url?: string;
  title_default?: string;
  title_reddit?: string;
  tags?: string[];
  platforms?: string[];
  scheduled_time?: Date | null;

  platform_posts: {
    linkedin?: string;
    instagram?: string;
    reddit?: string;
    twitter?: string;
  };

  workflow1_output?: Record<string, unknown>;
  workflow2_output?: Record<string, unknown>;
  review_status?: "draft" | "awaiting_review" | "published" | "rejected";
  published_at?: Date;

  tracking: {
    enabled: boolean;
    interval_hours: number;
    next_run_at?: Date;
    expires_at?: Date;
  };

  status: "active" | "paused" | "deleted";
  version: number;

  created_at: Date;
  updated_at: Date;
}

const postSchema = new Schema<IPost>(
  {
    _id: {
      type: String,
      required: true,
    },

    batch_id: {
      type: String,
      required: true,
    },

    user_id: {
      type: String,
      required: true,
      index: true,
    },

    brandId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
    },
    tone: {
      type: String,
    },
    post_details: {
      type: String,
    },
    context: {
      type: String,
    },
    image_preference: {
      type: String,
    },
    image_prompt: {
      type: String,
    },
    reference_image_url: {
      type: String,
    },

    content: {
      type: String,
      required: true,
    },

    image_url: {
      type: String,
    },
    title_default: {
      type: String,
    },
    title_reddit: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    platforms: [
      {
        type: String,
      },
    ],
    scheduled_time: {
      type: Date,
      default: null,
    },

    platform_posts: {
      linkedin: { type: String },
      instagram: { type: String },
      reddit: { type: String },
      twitter: { type: String },
    },
    workflow1_output: {
      type: Schema.Types.Mixed,
    },
    workflow2_output: {
      type: Schema.Types.Mixed,
    },
    review_status: {
      type: String,
      enum: ["draft", "awaiting_review", "published", "rejected"],
      default: "awaiting_review",
    },
    published_at: {
      type: Date,
    },

    tracking: {
      enabled: {
        type: Boolean,
        default: false,
      },
      interval_hours: {
        type: Number,
        default: 48,
      },
      next_run_at: {
        type: Date,
      },
      expires_at: {
        type: Date,
      },
    },

    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Performance indexes for AI tracking loop
postSchema.index({ brandId: 1, created_at: -1 });
postSchema.index({ batch_id: 1 });
postSchema.index({ "tracking.next_run_at": 1 });

export const Post = model<IPost>("Post", postSchema);
