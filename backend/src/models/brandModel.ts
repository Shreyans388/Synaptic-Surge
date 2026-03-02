
import { Schema, model, Types } from "mongoose";

export interface IBrand {
  userId: Types.ObjectId;
  brand_name: string;
  brand_voice?: string;
  logo?: string;
  brand_colors?: string[];
  brand_style?: string;
  brand_text?: string;
  cta_style?: string;
  logo_url?: string;
  logo_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const brandSchema = new Schema<IBrand>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand_name: { type: String, required: true },
    brand_voice: String,
    logo: String,
    brand_colors: [{ type: String }],
    brand_style: String,
    brand_text: String,
    cta_style: String,
    logo_url: String,
    logo_position: {
      type: String,
      enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center"],
    },
  },
  { timestamps: true }
);

export const Brand = model<IBrand>("Brand", brandSchema);
