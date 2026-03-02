import { Schema, model } from "mongoose";
import { randomUUID } from "crypto";

export type PlatformType = "linkedin" | "instagram" | "twitter" | "reddit";

export interface ISocialAccount {
  _id: string;
  user: string;
  brand: string;
  platform: PlatformType;
  access_token: string;
  expires_at?: Date;
  meta?: Record<string, any>;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    user: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    platform: {
      type: String,
      enum: ["linkedin", "instagram", "twitter", "reddit"],
      required: true,
    },
    access_token: { type: String, required: true },
   
    expires_at: Date,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// // Optional but recommended
// socialAccountSchema.index(
//   { user: 1, brand: 1, platform: 1 },
//   { unique: true }
// );

export const SocialAccount = model<ISocialAccount>(
  "SocialAccount",
  socialAccountSchema
);
