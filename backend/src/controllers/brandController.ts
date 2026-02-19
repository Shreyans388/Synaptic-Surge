import type { Request, Response } from "express";
import { Brand } from "../models/brandModel.js";

export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, image, description, brandVoice } = req.body;

    if (!name || !image || !description || !brandVoice?.tone) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existing = await Brand.findOne({ name });
    if (existing) {
      res.status(400).json({ message: "Brand already exists" });
      return;
    }

    const brand = await Brand.create({
      name,
      image,
      description,
      brandVoice: {
        tone: brandVoice.tone,
        keywords: brandVoice.keywords || [],
        bannedWords: brandVoice.bannedWords || [],
      },
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const disconnectPlatform = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { brandId, provider } = req.params;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }

    switch (provider) {
      case "linkedin":
        brand.platforms.linkedin = {
          encryptedAccessToken: null,
          expiresAt: null,
          accountId: null,
        };
        break;
      case "instagram":
        brand.platforms.instagram = {
          encryptedAccessToken: null,
          expiresAt: null,
          accountId: null,
        };
        break;
      case "reddit":
        brand.platforms.reddit = {
          encryptedAccessToken: null,
          expiresAt: null,
          accountId: null,
        };
        break;
      default:
        res.status(400).json({ message: "Invalid provider" });
        return;
    }

    await brand.save();

    res.status(200).json({
      message: `${provider} disconnected successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
