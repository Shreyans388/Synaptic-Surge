
import { Schema, model, Types } from "mongoose";

export interface IBrand {
  user: Types.ObjectId;
  name: string;
  description?: string;
  brandVoice?: string;
  logo?: string;
  brandColors?: string[];
  brandStyle?: string;
  brandText?: string;
  ctaStyle?: string;
  logoUrl?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const brandSchema = new Schema<IBrand>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    brandVoice: String,
    logo: String,
    brandColors: [{ type: String }],
    brandStyle: String,
    brandText: String,
    ctaStyle: String,
    logoUrl: String,
    logoPosition: {
      type: String,
      enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center"],
    },
  },
  { timestamps: true }
);

export const Brand = model<IBrand>("Brand", brandSchema);
