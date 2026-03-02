import { apiRequest } from "@/services/api/client";
import { Post } from "@/types/domain.type";

export interface GenerateWorkflow1Payload {
  brandId?: string;
  userId?: string;
  userEmail?: string;
  brand_name?: string;
  topic: string;
  tone: string;
  post_details: string;
  context: string;
  image_preference: string;
  image_prompt: string;
  reference_image_url: string;
}

interface CreateAndPublishResponse {
  post: Post;
  workflow1: unknown;
}

interface PublishPostResponse {
  post: Post;
  workflow2: unknown;
}

export const getPosts = async (brandId: string): Promise<Post[]> => {
  const params = new URLSearchParams({ brandId });
  return apiRequest<Post[]>(`/api/posts?${params.toString()}`, {
    method: "GET",
  });
};

export const approvePost = async (postId: string): Promise<Post> => {
  return apiRequest<Post>(`/api/posts/${postId}/approve`, {
    method: "POST",
  });
};

export const generateDraftPost = async (
  payload: GenerateWorkflow1Payload
): Promise<CreateAndPublishResponse> => {
  return apiRequest<CreateAndPublishResponse>("/api/posts/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const publishDraftPost = async (
  postId: string,
  scheduled_time?: string | null
): Promise<PublishPostResponse> => {
  return apiRequest<PublishPostResponse>(`/api/posts/${postId}/publish`, {
    method: "POST",
    body: JSON.stringify({
      scheduled_time: scheduled_time ?? null,
    }),
  });
};

export const generateDraft = async (
  payload: GenerateWorkflow1Payload
): Promise<Post> => {
  const response = await generateDraftPost(payload);
  return response.post;
};
