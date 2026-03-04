import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SocialAccount } from "../models/socialAccountModel.js";
import type { PlatformType } from "../models/socialAccountModel.js";


import {
  getLinkedInAuthUrl,
  exchangeLinkedInCode,
  fetchLinkedInProfile,
} from "../providers/linkedin.provider.js";
import {
  getInstagramAuthUrl,
  exchangeInstagramCode,
  exchangeInstagramLongLivedToken,
  fetchInstagramUserId,
} from "../providers/instagram.provider.js";
import type { OauthStatePayload, SupportedProvider } from "../types/oauth.types.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL ??
  process.env.CLIENT_ORIGIN ??
  "http://localhost:3000";
const isSupportedProvider = (
  provider: string
): provider is SupportedProvider => {
  return ["linkedin", "instagram", "twitter"].includes(provider);
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

const redirectWithStatus = (
  provider: SupportedProvider,
  res: Response,
  status: string
) => {
  const params = new URLSearchParams({
    oauth: provider,
    status,
  });

  res.redirect(`${FRONTEND_URL}/settings?${params.toString()}`);
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

/* ================================
   STEP 1: INITIATE OAUTH
================================ */

export const oauthAuth = async (
  req: Request<{ provider: string }>,
  res: Response
) => {
  const provider = req.params.provider;
  const { brandId } = req.query;

  if (!isSupportedProvider(provider)) {
    return res.status(400).json({ message: "Unsupported provider" });
  }

  if (!brandId || typeof brandId !== "string") {
    return res.status(400).json({ message: "brandId required" });
  }

  try {
    const state = signState({
      userId: req.user!._id.toString(),
      brandId,
      provider,
    });

    switch (provider) {
      case "linkedin":
        return res.redirect(getLinkedInAuthUrl(state));
      case "instagram":
        return res.redirect(getInstagramAuthUrl(state));

      default:
        return redirectWithStatus(provider, res, "not-configured");
    }
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("OAuth init failed:", {
      provider,
      brandId,
      error: message,
    });
    return res.status(500).json({
      message: "OAuth init failed",
      provider,
      error: message,
    });
  }
};

/* ================================
   STEP 2: CALLBACK
================================ */

export const oauthCallback = async (
  req: Request<{ provider: string }>,
  res: Response
) => {
  const provider = req.params.provider;

  if (!isSupportedProvider(provider)) {
    return res.status(400).json({ message: "Unsupported provider" });
  }

  try {
    const { code, state, error } = req.query;

    if (error) {
      return redirectWithStatus(provider, res, "denied");
    }

    if (!state || typeof state !== "string") {
      return redirectWithStatus(provider, res, "invalid-state");
    }

    const payload = verifyState(state);

    if (payload.provider !== provider) {
      return redirectWithStatus(provider, res, "invalid-state");
    }

    if (!code || typeof code !== "string") {
      return redirectWithStatus(provider, res, "missing-code");
    }

    const { userId, brandId } = payload;

    switch (provider) {
      case "linkedin": {
        const { access_token, expires_in } =
          await exchangeLinkedInCode(code);

        const profile = await fetchLinkedInProfile(access_token);

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
            meta: {
              linkedin_urn: profile.sub,
              accountName: profile.name,
              email: profile.email,
            },
          },
          { upsert: true, new: true }
        );

        return redirectWithStatus(provider, res, "connected");
      }
      case "instagram": {

  const { access_token: shortToken } =
    await exchangeInstagramCode(code);

  let finalToken = shortToken;
  let expiresAt: Date | undefined;

  try {
    const longToken =
      await exchangeInstagramLongLivedToken(shortToken);

    if (longToken?.access_token) {
      finalToken = longToken.access_token;
    }

    if (longToken?.expires_in) {
      expiresAt = new Date(Date.now() + longToken.expires_in * 1000);
    }
  } catch (err) {
    console.warn("Long token exchange failed", err);
  }

  const instagramUserId =
    await fetchInstagramUserId(finalToken);

  await SocialAccount.findOneAndUpdate(
    {
      user: userId,
      brand: brandId,
      platform: provider,
    },
    {
      access_token: finalToken,
      ...(expiresAt ? { expires_at: expiresAt } : {}),
      meta: {
        instagram_user_id: instagramUserId,
      },
    },
    { upsert: true, new: true }
  );

  return redirectWithStatus(provider, res, "connected");
}

      default:
        return redirectWithStatus(provider, res, "not-configured");
    }
  } catch (err) {
    console.error("OAuth callback failed:", {
      provider,
      error: getErrorMessage(err),
    });
    return redirectWithStatus(
      isSupportedProvider(provider) ? provider : "linkedin",
      res,
      "failed"
    );
  }
};
