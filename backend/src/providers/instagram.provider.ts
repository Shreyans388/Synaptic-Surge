import axios from "axios";

export const getInstagramAuthUrl = (state: string) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error("Instagram OAuth not configured");
  }

  const scope =
    "instagram_basic,instagram_content_publish,pages_show_list";

  return (
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code` +
    `&state=${encodeURIComponent(state)}`
  );
};


export const exchangeInstagramCode = async (code: string) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      },
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
};


export const exchangeInstagramLongLivedToken = async (
  shortToken: string
) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        fb_exchange_token: shortToken,
      },
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
};


export const fetchInstagramUserId = async (accessToken: string) => {
  const pages = await axios.get(
    "https://graph.facebook.com/v19.0/me/accounts",
    {
      params: { access_token: accessToken },
    }
  );

  const pageId = pages.data.data?.[0]?.id;

  if (!pageId) return null;

  const igAccount = await axios.get(
    `https://graph.facebook.com/v19.0/${pageId}`,
    {
      params: {
        fields: "instagram_business_account",
        access_token: accessToken,
      },
    }
  );

  return igAccount.data.instagram_business_account?.id ?? null;
};