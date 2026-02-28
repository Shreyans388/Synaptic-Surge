import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Brand } from "../models/brandModel.js";
import { SocialAccount } from "../models/socialAccountModel.js";


export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, brandVoice, logo } = req.body;

    if (!name) {
      res.status(400).json({ message: "Brand name is required" });
      return;
    }

    const existing = await Brand.findOne({ name });
    if (existing) {
      res.status(400).json({ message: "Brand already exists" });
      return;
    }

    const brand = await Brand.create({
      name,
      description,
      brandVoice,
      logo,
      user: req.user!._id,
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =====================================================
   DISCONNECT PLATFORM
===================================================== */

interface DisconnectParams {
  brandId: string;
  provider: "linkedin" | "instagram" | "reddit";
}

export const disconnectPlatform = async (
  req: Request & { params: DisconnectParams },
  res: Response
): Promise<void> => {
  try {
    const { brandId, provider } = req.params;

    if (!Types.ObjectId.isValid(brandId)) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const deleted = await SocialAccount.findOneAndDelete({
      brand: new Types.ObjectId(brandId),
      platform: provider,
      user: req.user!._id, // secure: ensure ownership
    });

    if (!deleted) {
      res.status(404).json({ message: "Platform not connected" });
      return;
    }

    res.status(200).json({
      message: `${provider} disconnected successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};