import type { Request, Response } from "express";
import axios from "axios";
import { Brand } from "../models/brandModel.js";
import { encrypt } from "../lib/utils.js";


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

export const linkedinCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state } = req.query;
    const brandId = state as string;

    if (!code || !brandId) {
      res.status(400).json({ message: "Invalid OAuth callback" });
      return;
    }

    // Exchange code for access token
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

    // Get LinkedIn profile (accountId)
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const accountId = profileResponse.data.sub;

    const encryptedToken = encrypt(access_token);

    await Brand.findByIdAndUpdate(brandId, {
      "platforms.linkedin.encryptedAccessToken": encryptedToken,
      "platforms.linkedin.expiresAt": new Date(
        Date.now() + expires_in * 1000
      ),
      "platforms.linkedin.accountId": accountId,
    });

    res.json({ message: "LinkedIn connected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OAuth failed" });
  }
};
