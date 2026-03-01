import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Brand } from "../models/brandModel.js";
import { SocialAccount } from "../models/socialAccountModel.js";
import type { PlatformType } from "../models/socialAccountModel.js";

interface BrandPayload {
  name?: string;
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

const mapBrandPayload = (body: Record<string, unknown>): BrandPayload => {
  const payload: BrandPayload = {};

  if (typeof body.name === "string") payload.name = body.name;
  if (typeof body.description === "string") payload.description = body.description;

  const brandVoice =
    typeof body.brandVoice === "string"
      ? body.brandVoice
      : typeof body.brand_voice === "string"
        ? body.brand_voice
        : undefined;
  if (brandVoice) payload.brandVoice = brandVoice;

  const logo =
    typeof body.logo === "string"
      ? body.logo
      : typeof body.logo_url === "string"
        ? body.logo_url
        : undefined;
  if (logo) payload.logo = logo;

  const colors = Array.isArray(body.brandColors)
    ? (body.brandColors as unknown[]).filter((v): v is string => typeof v === "string")
    : Array.isArray(body.brand_colors)
      ? (body.brand_colors as unknown[]).filter((v): v is string => typeof v === "string")
      : undefined;
  if (colors) payload.brandColors = colors;

  const brandStyle =
    typeof body.brandStyle === "string"
      ? body.brandStyle
      : typeof body.brand_style === "string"
        ? body.brand_style
        : undefined;
  if (brandStyle) payload.brandStyle = brandStyle;

  const brandText =
    typeof body.brandText === "string"
      ? body.brandText
      : typeof body.brand_text === "string"
        ? body.brand_text
        : undefined;
  if (brandText) payload.brandText = brandText;

  const ctaStyle =
    typeof body.ctaStyle === "string"
      ? body.ctaStyle
      : typeof body.cta_style === "string"
        ? body.cta_style
        : undefined;
  if (ctaStyle) payload.ctaStyle = ctaStyle;

  const logoUrl =
    typeof body.logoUrl === "string"
      ? body.logoUrl
      : typeof body.logo_url === "string"
        ? body.logo_url
        : undefined;
  if (logoUrl) payload.logoUrl = logoUrl;

  const logoPosition =
    typeof body.logoPosition === "string"
      ? body.logoPosition
      : typeof body.logo_position === "string"
        ? body.logo_position
        : undefined;
  if (
    logoPosition === "top-left" ||
    logoPosition === "top-right" ||
    logoPosition === "bottom-left" ||
    logoPosition === "bottom-right" ||
    logoPosition === "center"
  ) {
    payload.logoPosition = logoPosition;
  }

  return payload;
};

export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = mapBrandPayload(req.body as Record<string, unknown>);
    const { name } = payload;

    if (!name) {
      res.status(400).json({ message: "Brand name is required" });
      return;
    }

    const existing = await Brand.findOne({ name, user: req.user!._id });
    if (existing) {
      res.status(400).json({ message: "Brand already exists" });
      return;
    }

    const brand = await Brand.create({
      user: req.user!._id,
      ...payload,
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBrand = async (
  req: Request<{ brandId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { brandId } = req.params;
    if (!Types.ObjectId.isValid(brandId)) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const payload = mapBrandPayload(req.body as Record<string, unknown>);
    delete payload.name;

    const updated = await Brand.findOneAndUpdate(
      { _id: new Types.ObjectId(brandId), user: req.user!._id },
      { $set: payload },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const brands = await Brand.find({ user: userId }).sort({ createdAt: -1 }).lean();

    if (brands.length === 0) {
      res.status(200).json([]);
      return;
    }

    const brandIds = brands.map((brand) => brand._id);
    const socialAccounts = await SocialAccount.find({
      user: userId,
      brand: { $in: brandIds },
    })
      .select("brand platform")
      .lean();

    const connectionsByBrand = socialAccounts.reduce<Record<string, PlatformType[]>>(
      (acc, account) => {
        const key = account.brand.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(account.platform);
        return acc;
      },
      {}
    );

    res.status(200).json(
      brands.map((brand) => ({
        ...brand,
        connectedPlatforms: connectionsByBrand[brand._id.toString()] ?? [],
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrandConnections = async (
  req: Request<{ brandId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { brandId } = req.params;
    if (!Types.ObjectId.isValid(brandId)) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const userId = req.user!._id;
    const connections = await SocialAccount.find({
      user: userId,
      brand: new Types.ObjectId(brandId),
    })
      .select("platform expires_at updatedAt")
      .lean();

    res.status(200).json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

interface DisconnectParams {
  brandId: string;
  provider: PlatformType;
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
      user: req.user!._id,
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
