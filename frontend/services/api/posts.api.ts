import { Post } from "@/types/domain.type";
import { mockPosts } from "../mocks/posts.mock";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getPosts = async (
  brandId: string
): Promise<Post[]> => {
  await delay(600);
  return mockPosts.filter((p) => p.brandId === brandId);
};

export const approvePost = async (postId: string) => {
  await delay(500);

  const post = mockPosts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  post.overallStatus = "published";
  post.publishedAt = new Date().toISOString();

  post.platformDrafts = post.platformDrafts.map((d) => ({
    ...d,
    status: "published",
  }));

  return post;
};

export const generateDraft = async (
  brandId: string,
  topic: string
) => {
  await delay(1000);

  const newPost: Post = {
    id: crypto.randomUUID(),
    brandId,
    masterBrief: {
      topic,
      goal: "Engagement",
      targetAudience: "General audience",
    },
    platformDrafts: [
      {
        platform: "linkedin",
        content: `AI-generated draft about ${topic}`,
        hashtags: ["#AI", "#Automation"],
        version: 1,
        status: "awaiting_review",
        aiGenerated: true,
        updatedAt: new Date().toISOString(),
      },
    ],
    overallStatus: "awaiting_review",
    createdAt: new Date().toISOString(),
  };

  mockPosts.unshift(newPost);

  return newPost;
};