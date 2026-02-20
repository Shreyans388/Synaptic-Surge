import { Schema, model, Types } from "mongoose";

export type PlatformType = "linkedin" | "instagram" | "reddit";

export interface ISocialAccount {
  user: Types.ObjectId;
  brand: Types.ObjectId;
  platform: PlatformType;
  access_token: string;
  expires_at?: Date;
  meta?: Record<string, any>;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    platform: {
      type: String,
      enum: ["linkedin", "instagram", "reddit"],
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