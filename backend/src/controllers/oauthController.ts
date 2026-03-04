import type { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { SocialAccount } from "../models/socialAccountModel.js";
import type { PlatformType } from "../models/socialAccountModel.js";

type SupportedProvider = "linkedin" | "instagram" | "twitter";

interface OauthStatePayload {
  userId: string;
  brandId: string;
  provider: SupportedProvider;
}

const FRONTEND_URL = process.env.FRONTEND_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:3001";

const isSupportedProvider = (provider: string): provider is SupportedProvider => {
  return provider === "linkedin" || provider === "instagram" || provider === "twitter";
};

const signState = (payload: OauthStatePayload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, secret, { expiresIn: "10m" });
};

const verifyState = (state: string): OauthStatePayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.verify(state, secret) as OauthStatePayload;
};

const providerNotConfiguredRedirect = (provider: SupportedProvider, res: Response) => {
  const params = new URLSearchParams({
    oauth: provider,
    status: "not-configured",
  });
  res.redirect(`${FRONTEND_URL}/settings?${params.toString()}`);
};

const successRedirect = (provider: SupportedProvider, res: Response) => {
  const params = new URLSearchParams({
    oauth: provider,
    status: "connected",
  });
  res.redirect(`${FRONTEND_URL}/settings?${params.toString()}`);
};

const failureRedirect = (provider: SupportedProvider, res: Response, reason = "failed") => {
  const params = new URLSearchParams({
    oauth: provider,
    status: reason,
  });
  res.redirect(`${FRONTEND_URL}/settings?${params.toString()}`);
};

export const oauthAuth = async (req: Request<{ provider: string }>, res: Response) => {
  const provider = req.params.provider;
  const { brandId } = req.query;

  if (!isSupportedProvider(provider)) {
    res.status(400).json({ message: "Unsupported provider" });
    return;
  }

  if (!brandId || typeof brandId !== "string") {
    res.status(400).json({ message: "brandId is required" });
    return;
  }

  try {
    const state = signState({
      userId: req.user!._id.toString(),
      brandId,
      provider,
    });

    if (provider === "linkedin") {
      if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_REDIRECT_URI) {
        providerNotConfiguredRedirect(provider, res);
        return;
      }

      const authUrl =
        `https://www.linkedin.com/oauth/v2/authorization` +
        `?response_type=code` +
        `&client_id=${process.env.LINKEDIN_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}` +
        `&scope=${encodeURIComponent("openid profile w_member_social")}` +
        `&state=${encodeURIComponent(state)}`;

      res.redirect(authUrl);
      return;
    }

    providerNotConfiguredRedirect(provider, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OAuth initialization failed" });
  }
};

export const oauthCallback = async (req: Request<{ provider: string }>, res: Response) => {
  const provider = req.params.provider;

  if (!isSupportedProvider(provider)) {
    res.status(400).json({ message: "Unsupported provider" });
    return;
  }

  try {
    const { code, state } = req.query;

    if (!state || typeof state !== "string") {
      failureRedirect(provider, res, "invalid-state");
      return;
    }

    const payload = verifyState(state);
    if (payload.provider !== provider) {
      failureRedirect(provider, res, "invalid-state");
      return;
    }

    const brandId = payload.brandId;
    const userId = payload.userId;

    if (provider === "linkedin") {
      if (
        !code ||
        typeof code !== "string" ||
        !process.env.LINKEDIN_REDIRECT_URI ||
        !process.env.LINKEDIN_CLIENT_ID ||
        !process.env.LINKEDIN_CLIENT_SECRET
      ) {
        failureRedirect(provider, res, "missing-code");
        return;
      }

      const tokenResponse = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token, expires_in } = tokenResponse.data as {
        access_token: string;
        expires_in: number;
      };

      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await SocialAccount.findOneAndUpdate(
        {
          user: userId,
          brand: brandId,
          platform: provider as PlatformType,
        },
        {
          access_token,
          expires_at: expiresAt,
        },
        { upsert: true, new: true }
      );

      successRedirect(provider, res);
      return;
    }

    failureRedirect(provider, res, "not-configured");
  } catch (err) {
    console.error(err);
    const fallbackProvider = isSupportedProvider(provider) ? provider : "linkedin";
    failureRedirect(fallbackProvider, res);
  }
};
