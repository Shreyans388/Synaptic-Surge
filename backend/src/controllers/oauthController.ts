import type { Request, Response } from "express";
import axios from "axios";
import { SocialAccount } from "../models/socialAccountModel.js";
import { Types } from "mongoose";






export const linkedinAuth = async (req: Request, res: Response) => {
  const { brandId } = req.query;

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code` +
    `&client_id=${process.env.LINKEDIN_CLIENT_ID}` +
    `&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}` +
    `&scope=openid profile w_member_social` +
    `&state=${brandId}`;

  res.redirect(authUrl);
};


export const linkedinCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!state || typeof state !== "string") {
      return res.status(400).json({ message: "Invalid state" });
    }

    const brandId = new Types.ObjectId(state);
    const userId = req.user!._id;

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = tokenResponse.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await SocialAccount.findOneAndUpdate(
      {
        user: userId,
        brand: brandId,
        platform: "linkedin",
      },
      {
        access_token,
        expires_at: expiresAt,
      },
      { upsert: true, new: true }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/success`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "LinkedIn OAuth failed" });
  }
};
