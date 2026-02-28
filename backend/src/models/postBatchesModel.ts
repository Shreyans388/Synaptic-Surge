import { Schema, model, Types } from "mongoose";

export interface IPostBatch {
  _id: string;
  user_id: string;
  brandId: Types.ObjectId;
  posts: Types.ObjectId[];
  status: "active" | "paused" | "completed";
  created_at: Date;
}

const postBatchSchema = new Schema<IPostBatch>(
  {
    _id: {
      type: String,
      required: true,
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

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

postBatchSchema.index({ user_id: 1 });
postBatchSchema.index({ brandId: 1 });
postBatchSchema.index({ created_at: -1 });

export const PostBatch = model<IPostBatch>("PostBatch", postBatchSchema);