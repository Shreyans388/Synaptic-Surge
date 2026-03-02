import type { Request, Response } from 'express';
import axios from 'axios';
import { SocialAccount } from '../models/socialAccountModel.js';

export const getLinkedInOAuthUrl = (req: Request, res: Response) => {
  // 1. Move these INSIDE the function so they are read dynamically!
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

  if (!CLIENT_ID) {
    console.error("CRITICAL: LINKEDIN_CLIENT_ID is missing from backend .env!");
    return res.status(500).json({ message: "Server environment missing Client ID" });
  }

  const { userId, brandId } = req.query;

  if (!userId || !brandId) {
    return res.status(400).json({ message: "userId and brandId are required" });
  }

  const stateObj = JSON.stringify({ userId, brandId });
  const encodedState = Buffer.from(stateObj).toString('base64');

  const scope = 'openid profile email w_member_social'; 
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${encodedState}&scope=${encodeURIComponent(scope)}`;
  
  res.json({ url: authUrl });
};

export const handleLinkedInCallback = async (req: Request, res: Response) => {
  // 2. Move these INSIDE the callback function too
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth Error:', error_description);
    return res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=false&error=${error}`);
  }

  try {
    const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
    const { userId, brandId } = decodedState;

    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: REDIRECT_URI!,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, expires_in } = tokenResponse.data;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const linkedInId = profileResponse.data.sub;
    const linkedInName = profileResponse.data.name;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await SocialAccount.findOneAndUpdate(
      { user: userId, brand: brandId, platform: 'linkedin' },
      {
        access_token,
        expires_at: expiresAt,
        meta: { linkedin_urn: linkedInId, accountName: linkedInName }
      },
      { upsert: true, returnDocument: 'after' } 
    );

    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=true&brand=${brandId}`);

  } catch (err) {
    console.error('LinkedIn Callback Failed:', err);
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=false`);
  }
};