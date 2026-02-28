
import { Schema, model, Types } from "mongoose";

export interface IBrand {
  user: Types.ObjectId;
  name: string;
  description?: string;
  brandVoice?: string;
  logo?: string;
}

const brandSchema = new Schema<IBrand>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    brandVoice: String,
    logo: String,
  },
  { timestamps: true }
);

export const Brand = model<IBrand>("Brand", brandSchema);