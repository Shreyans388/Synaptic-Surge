import mongoose, { Document, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  image: string;
  description: string;

  brandVoice: {
    tone: string;
    keywords: string[];
    bannedWords: string[];
  };

  platforms: {
    linkedin?: {
      encryptedAccessToken?: string | null;
     
      expiresAt?: Date | null;
      accountId?: string | null;
    };
    instagram?: {
      encryptedAccessToken?: string | null;
     
      expiresAt?: Date | null;
      accountId?: string | null;
    };
    reddit?: {
      encryptedAccessToken?: string | null;

      expiresAt?: Date | null;
      accountId?: string | null;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, required: true },

    brandVoice: {
      tone: { type: String, required: true },
      keywords: [String],
      bannedWords: [String],
    },

    platforms: {
      linkedin: {
        encryptedAccessToken: { type: String, default: null },
       
        expiresAt: { type: Date, default: null },
        accountId: { type: String, default: null },
      },
      instagram: {
        encryptedAccessToken: { type: String, default: null },
       
        expiresAt: { type: Date, default: null },
        accountId: { type: String, default: null },
      },
      reddit: {
        encryptedAccessToken: { type: String, default: null },

        expiresAt: { type: Date, default: null },
        accountId: { type: String, default: null },
      },
    },
  },
  { timestamps: true }
);

export const Brand: Model<IBrand> = mongoose.model<IBrand>(
  "Brand",
  brandSchema
);
