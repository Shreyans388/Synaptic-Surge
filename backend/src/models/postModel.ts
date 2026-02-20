import { Schema, model, Types } from "mongoose";

export interface IPost {
  _id: string;
  batch_id: string;
  user_id: string;
  brandId: Types.ObjectId;

  content: string;
  image_url?: string;

  platform_posts: {
    linkedin?: string;
    instagram?: string;
    reddit?: string;
  };

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
      index: true,
    },

    user_id: {
      type: String,
      required: true,
      index: true,
    },

    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    image_url: {
      type: String,
    },

    platform_posts: {
      linkedin: { type: String },
      instagram: { type: String },
      reddit: { type: String },
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
        index: true,
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