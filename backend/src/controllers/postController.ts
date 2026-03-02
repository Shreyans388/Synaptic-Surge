import type { Request, Response } from "express";
import axios from "axios";
import { randomUUID } from "crypto";
import { Post } from "../models/postModel.js";
import { Brand } from "../models/brandModel.js";

type ReviewStatus = "draft" | "awaiting_review" | "published" | "rejected";
type Platform = "linkedin" | "instagram" | "reddit" ;

interface GenerateBody {
  brandId?: string;
  userId?: string;
  userEmail?: string;
  brand_name?: string;
  topic?: string;
  tone?: string;
  post_details?: string;
  context?: string;
  image_preference?: string;
  image_prompt?: string;
  reference_image_url?: string;
}

interface PublishBody {
  scheduled_time?: string | null;
}

interface Workflow1Output {
  user_id?: string;
  image_url?: string;
  content?: Partial<Record<Platform, string>>;
  title?: {
    default?: string;
    reddit?: string;
  };
  tags?: string[];
  platforms?: Platform[];
  scheduled_time?: string | null;
}

interface Workflow1Input {
  userId: string;
  userEmail: string;
  brand_name?: string | undefined;
  brand_colors?: string[] | undefined;
  brand_style?: string | undefined;
  brand_text?: string | undefined;
  brand_voice?: string | undefined;
  cta_style?: string | undefined;
  logo_url?: string | undefined;
  logo_position?: string | undefined;
  topic?: string | undefined;
  tone?: string | undefined;
  post_details?: string | undefined;
  context?: string | undefined;
  image_preference?: string | undefined;
  image_prompt?: string | undefined;
  reference_image_url?: string | undefined;
}

const normalizeWebhookData = <T>(data: unknown): T => {
  if (Array.isArray(data) && data.length > 0) return data[0] as T;
  return data as T;
};

const safeText = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

const safeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return items.length > 0 ? items : undefined;
};

const toReviewStatus = (value: unknown): ReviewStatus => {
  if (value === "published") return "published";
  if (value === "draft") return "draft";
  if (value === "rejected") return "rejected";
  return "awaiting_review";
};

const buildPlatformPosts = (content: Partial<Record<Platform, string>> | undefined) => {
  const result: Partial<Record<Platform, string>> = {};
  if (!content) return result;

  const linkedin = safeText(content.linkedin);
  const instagram = safeText(content.instagram);
  const reddit = safeText(content.reddit);

  if (linkedin) result.linkedin = linkedin;
  if (instagram) result.instagram = instagram;
  if (reddit) result.reddit = reddit;
  return result;
};

const mapPostToFrontend = (post: {
  _id: string;
  brandId: string;
  topic?: string;
  tone?: string;
  context?: string;
  content: string;
  tags?: string[];
  platform_posts?: Partial<Record<Platform, string>>;
  review_status?: ReviewStatus;
  created_at: Date;
  published_at?: Date;
}) => {
  const reviewStatus = toReviewStatus(post.review_status);
  const drafts = Object.entries(post.platform_posts ?? {})
    .filter(([platform]) => platform === "linkedin" || platform === "instagram" || platform === "reddit")
    .filter(([, text]) => typeof text === "string" && text.trim().length > 0)
    .map(([platform, text]) => ({
      platform: platform as "linkedin" | "instagram" | "reddit",
      content: text as string,
      hashtags: post.tags ?? [],
      version: 1,
      status: reviewStatus,
      aiGenerated: true,
      updatedAt: post.created_at.toISOString(),
    }));

  return {
    id: post._id,
    brandId: post.brandId,
    masterBrief: {
      topic: post.topic ?? (post.content.slice(0, 80) || "Untitled"),
      goal: "Engagement",
      targetAudience: post.tone ?? post.context ?? "General audience",
    },
    platformDrafts:
      drafts.length > 0
        ? drafts
        : [
            {
              platform: "linkedin" as const,
              content: post.content,
              hashtags: post.tags ?? [],
              version: 1,
              status: reviewStatus,
              aiGenerated: true,
              updatedAt: post.created_at.toISOString(),
            },
          ],
    overallStatus: reviewStatus,
    createdAt: post.created_at.toISOString(),
    ...(post.published_at ? { publishedAt: post.published_at.toISOString() } : {}),
  };
};

interface ResolvedBrand {
  _id: string;
  brand_name: string;
  brand_colors?: string[];
  brand_style?: string;
  brand_text?: string;
  brand_voice?: string;
  cta_style?: string;
  logo_url?: string;
  logo_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const getBrandByIdForUser = async (brandId: string, userId: string) => {
  return Brand.findOne({
    _id: brandId,
    userId,
  })
    .select("_id brand_name brand_colors brand_style brand_text brand_voice cta_style logo_url logo_position")
    .lean();
};

const getBrandByNameForUser = async (brandName: string, userId: string) => {
  return Brand.findOne({
    brand_name: brandName,
    userId,
  })
    .select("_id brand_name brand_colors brand_style brand_text brand_voice cta_style logo_url logo_position")
    .lean();
};

export const generatePostDraft = async (
  req: Request<{}, {}, GenerateBody>,
  res: Response
): Promise<void> => {
  try {
    console.log("generatePostDraft request body:", req.body);
    const workflow1Url = process.env.N8N_WORKFLOW_1_URL;
    if (!workflow1Url) {
      res.status(500).json({ message: "N8N_WORKFLOW_1_URL is not configured" });
      return;
    }

    const requestedBrandId = safeText(req.body.brandId);
    const requestedBrandName = safeText(req.body.brand_name);
    const authUserId = req.user!._id.toString();

    let brand: ResolvedBrand | null = null;
    if (requestedBrandId) {
      brand = (await getBrandByIdForUser(requestedBrandId, authUserId)) as ResolvedBrand | null;
    } else if (requestedBrandName) {
      brand = (await getBrandByNameForUser(requestedBrandName, authUserId)) as ResolvedBrand | null;
    } else {
      res.status(400).json({ message: "brand_name is required when brandId is not provided" });
      return;
    }

    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }

    const workflow1Payload: Workflow1Input = {
      userId: safeText(req.body.userId) ?? authUserId,
      userEmail: safeText(req.body.userEmail) ?? req.user!.email,
      brand_name: safeText(req.body.brand_name) ?? safeText(brand.brand_name),
      brand_colors: safeStringArray(brand.brand_colors),
      brand_style: safeText(brand.brand_style),
      brand_text: safeText(brand.brand_text),
      brand_voice: safeText(brand.brand_voice),
      cta_style: safeText(brand.cta_style),
      logo_url: safeText(brand.logo_url),
      logo_position: safeText(brand.logo_position),
      topic: safeText(req.body.topic),
      tone: safeText(req.body.tone),
      post_details: safeText(req.body.post_details),
      context: safeText(req.body.context),
      image_preference: safeText(req.body.image_preference),
      image_prompt: safeText(req.body.image_prompt),
      reference_image_url: safeText(req.body.reference_image_url),
    };

    if (!workflow1Payload.topic || !workflow1Payload.tone || !workflow1Payload.context) {
      res.status(400).json({ message: "topic, tone and context are required" });
      return;
    }

    const workflow1Res = await axios.post(workflow1Url, workflow1Payload, { timeout: 120000 });
    const workflow1Data = normalizeWebhookData<Workflow1Output>(workflow1Res.data);
    console.log("Workflow 1 output:", workflow1Data);
    if (!workflow1Data || typeof workflow1Data !== "object" || !workflow1Data.content) {
      res.status(502).json({ message: "Workflow 1 returned invalid payload" });
      return;
    }

    const platforms = Array.isArray(workflow1Data.platforms) ? workflow1Data.platforms : [];
    const tags = Array.isArray(workflow1Data.tags)
      ? workflow1Data.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    const createPayload: Record<string, unknown> = {
      _id: randomUUID(),
      batch_id: randomUUID(),
      user_id: workflow1Data.user_id ?? workflow1Payload.userId,
      brandId: brand._id,
      topic: workflow1Payload.topic,
      tone: workflow1Payload.tone,
      content:
        safeText(workflow1Data.title?.default) ??
        safeText(workflow1Data.content.linkedin) ??
        safeText(workflow1Data.content.instagram) ??
        safeText(workflow1Data.content.reddit) ??
        "",
      image_url: safeText(workflow1Data.image_url),
      platform_posts: buildPlatformPosts(workflow1Data.content),
      title_default: safeText(workflow1Data.title?.default),
      title_reddit: safeText(workflow1Data.title?.reddit),
      tags,
      platforms,
      scheduled_time: workflow1Data.scheduled_time ? new Date(workflow1Data.scheduled_time) : null,
      workflow1_output: workflow1Data as Record<string, unknown>,
      review_status: "draft",
      tracking: {
        enabled: false,
        interval_hours: 48,
      },
      status: "active",
      version: 1,
    };
    if (workflow1Payload.post_details) createPayload.post_details = workflow1Payload.post_details;
    if (workflow1Payload.context) createPayload.context = workflow1Payload.context;
    if (workflow1Payload.image_preference) createPayload.image_preference = workflow1Payload.image_preference;
    if (workflow1Payload.image_prompt) createPayload.image_prompt = workflow1Payload.image_prompt;
    if (workflow1Payload.reference_image_url) createPayload.reference_image_url = workflow1Payload.reference_image_url;

    const postDoc = (await Post.create(createPayload)) as { _id: string };
    const createdPost = await Post.findById(postDoc._id).lean();
    if (!createdPost) {
      res.status(500).json({ message: "Draft saved but could not be loaded" });
      return;
    }

    res.status(201).json({
      post: mapPostToFrontend(createdPost),
      workflow1: workflow1Data,
    });
  } catch (error) {
    console.error("generatePostDraft error:", error);
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        "Workflow 1 failed";
      res.status(502).json({ message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const publishDraftPost = async (
  req: Request<{ postId: string }, {}, PublishBody>,
  res: Response
): Promise<void> => {
  try {
    const workflow2Url = process.env.N8N_WORKFLOW_2_URL;
    if (!workflow2Url) {
      res.status(500).json({ message: "N8N_WORKFLOW_2_URL is not configured" });
      return;
    }

    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ message: "postId is required" });
      return;
    }

    const post = await Post.findOne({
      _id: postId,
      user_id: req.user!._id.toString(),
      status: { $ne: "deleted" },
    }).lean();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const workflow1Raw = post.workflow1_output;
    const workflow1Data = (workflow1Raw ?? {}) as Workflow1Output;
    if (!workflow1Data.content) {
      res.status(400).json({ message: "Draft has no workflow1 output to publish" });
      return;
    }

    const requestedSchedule = req.body?.scheduled_time ? new Date(req.body.scheduled_time) : null;
    if (req.body?.scheduled_time && Number.isNaN(requestedSchedule?.getTime())) {
      res.status(400).json({ message: "scheduled_time must be a valid ISO datetime" });
      return;
    }

    const publishPayload: Workflow1Output = {
      ...workflow1Data,
      ...(requestedSchedule ? { scheduled_time: requestedSchedule.toISOString() } : {}),
    };

    const workflow2Res = await axios.post(workflow2Url, publishPayload, { timeout: 120000 });
    const workflow2Data = normalizeWebhookData<unknown>(workflow2Res.data);

    const now = new Date();
    const updated = await Post.findOneAndUpdate(
      { _id: postId, user_id: req.user!._id.toString() },
      {
        $set: {
          scheduled_time: requestedSchedule,
          workflow2_output:
            workflow2Data && typeof workflow2Data === "object"
              ? (workflow2Data as Record<string, unknown>)
              : { result: workflow2Data },
          review_status: "published",
          published_at: now,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: "Post not found after publishing" });
      return;
    }

    res.status(200).json({
      post: mapPostToFrontend(updated),
      workflow2: workflow2Data,
    });
  } catch (error) {
    console.error("publishDraftPost error:", error);
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        "Workflow 2 failed";
      res.status(502).json({ message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (
  req: Request<{}, {}, {}, { brandId?: string }>,
  res: Response
): Promise<void> => {
  try {
    const brandId = req.query.brandId;
    if (!brandId) {
      res.status(400).json({ message: "brandId query param is required" });
      return;
    }

    const posts = await Post.find({
      brandId,
      user_id: req.user!._id.toString(),
      status: { $ne: "deleted" },
    })
      .sort({ created_at: -1 })
      .lean();

    res.status(200).json(posts.map((post) => mapPostToFrontend(post)));
  } catch (error) {
    console.error("getPosts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approvePost = async (
  req: Request<{ postId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ message: "postId is required" });
      return;
    }

    const post = await Post.findOneAndUpdate(
      {
        _id: postId,
        user_id: req.user!._id.toString(),
        status: { $ne: "deleted" },
      },
      {
        $set: {
          review_status: "published",
          published_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(mapPostToFrontend(post));
  } catch (error) {
    console.error("approvePost error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
