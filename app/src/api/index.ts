import { request } from "./request";
import type {
  AuthResult,
  AuthUser,
  Company,
  CompanyDetail,
  CompanyStatistics,
  Review,
  ReviewComment,
  ContentItem,
  HomeCategory,
  HomeCategoryType,
  HomepageRecommendation,
  CreateReviewInput,
  AiChatResult,
} from "./types";

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export const authApi = {
  login: (identifier: string, password: string) =>
    request<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  register: (email: string, password: string, nickname: string) =>
    request<AuthResult>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nickname }),
    }),
  profile: () => request<AuthUser>("/users/profile"),
};

export const companyApi = {
  list: (params: { page?: number; pageSize?: number; search?: string; industryId?: string }) =>
    request<Company[]>(`/companies${query(params)}`),
  detail: (id: string) => request<CompanyDetail>(`/companies/${id}`),
  statistics: (id: string) => request<CompanyStatistics>(`/companies/${id}/statistics`),
  favorite: (id: string) => request(`/companies/${id}/favorite`, { method: "POST" }),
  unfavorite: (id: string) => request(`/companies/${id}/favorite`, { method: "DELETE" }),
};

export const reviewApi = {
  list: (companyId: string, page = 1, pageSize = 10) =>
    request<Review[]>(`/companies/${companyId}/reviews${query({ page, pageSize })}`),
  create: (companyId: string, input: CreateReviewInput) =>
    request<Review>(`/companies/${companyId}/reviews`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  comments: (reviewId: string, page = 1, pageSize = 50) =>
    request<ReviewComment[]>(`/reviews/${reviewId}/comments${query({ page, pageSize })}`),
  comment: (reviewId: string, content: string) =>
    request<ReviewComment>(`/reviews/${reviewId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  like: (reviewId: string) => request<{ liked: true; likeCount: number }>(
    `/reviews/${reviewId}/like`,
    { method: "POST" },
  ),
  unlike: (reviewId: string) => request<{ liked: false; likeCount: number }>(
    `/reviews/${reviewId}/like`,
    { method: "DELETE" },
  ),
};

export const aiApi = {
  chat: (message: string, conversationId?: string) =>
    request<AiChatResult>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversationId }),
    }),
};

export const categoryApi = {
  list: (page = 1, pageSize = 20) =>
    request<HomeCategory[]>(`/categories${query({ page, pageSize })}`),
};

export const contentApi = {
  list: (category: Extract<HomeCategoryType, "INTERNET" | "LIFE_SERVICE">, page = 1, pageSize = 20) =>
    request<ContentItem[]>(`/contents${query({ category, page, pageSize })}`),
  detail: (id: string) => request<ContentItem>(`/contents/${id}`),
};

export const recommendApi = {
  homepage: (page = 1, pageSize = 6) =>
    request<HomepageRecommendation>(`/recommend${query({ page, pageSize })}`),
};

export * from "./request";
export * from "./types";
