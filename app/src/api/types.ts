export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  requestId?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: PageMeta;
}

export interface AuthUser {
  id: string;
  nickname: string;
  role: string;
}

export interface AuthResult {
  access_token: string;
  user: AuthUser;
}

export interface Industry {
  id: string;
  code: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  displayName: string;
  logo: string | null;
  logoUrl: string | null;
  city: string | null;
  cityCode: string | null;
  industry: Industry | null;
  averageScore: number;
  reviewCount: number;
  verificationStatus: string;
}

export interface CompanyDetail extends Company {
  legalName: string;
  description: string | null;
  companySize: string | null;
  address: string | null;
  registeredAddress: string | null;
  website: string | null;
  financingInfo: string | null;
  financingStageCode: string | null;
  tags: string[];
  createdAt: string;
}

export interface CompanyStatistics {
  companyId: string;
  reviewCount: number;
  overallScore: number;
  workEnvironmentScore: number;
  managementScore: number;
  salaryBenefitScore: number;
  growthScore: number;
  salaryRange: {
    min: number | null;
    max: number | null;
    average: number | null;
  };
  interviewDifficulty: number | null;
  interviewReviewCount: number;
  reviewTypeCounts: Partial<Record<ReviewType, number>>;
  updatedAt: string | null;
}

export type ReviewType = "INTERNSHIP" | "INTERVIEW" | "WORK";
export type ExperienceType = "INTERN" | "FULL_TIME";

export interface Review {
  id: string;
  companyId: string;
  title: string;
  reviewType: ReviewType;
  experienceType: ExperienceType;
  content: string;
  position: string | null;
  advantage: string | null;
  disadvantage: string | null;
  salary: number | null;
  salaryInfo: string | null;
  interviewDifficulty: number | null;
  workExperience: string | null;
  workEnvironmentScore: number;
  managementScore: number;
  salaryBenefitScore: number;
  growthScore: number;
  rating: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface CreateReviewInput {
  title: string;
  reviewType: ReviewType;
  experienceType: ExperienceType;
  content: string;
  position?: string;
  advantage?: string;
  disadvantage?: string;
  salary?: number;
  salaryInfo?: string;
  workExperience?: string;
  interviewDifficulty?: number;
  workEnvironmentScore: number;
  managementScore: number;
  salaryBenefitScore: number;
  growthScore: number;
}

export interface AiChatResult {
  answer: string;
  conversationId: string;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: string;
  author: { nickname: string };
}

export type HomeCategoryType =
  | "RECOMMEND"
  | "INTERNET"
  | "LIFE_SERVICE"
  | "AI"
  | "SMART_HARDWARE";

export interface HomeCategory {
  id: string;
  name: string;
  type: HomeCategoryType;
  description: string | null;
  icon: string | null;
  sort: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface ContentItem {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  cover: string | null;
  url: string;
  source: string | null;
  viewCount: number;
  createdAt: string;
  category: {
    id?: string;
    name: string;
    type: HomeCategoryType;
    icon: string | null;
  };
}

export interface RecommendedReview {
  id: string;
  companyId: string;
  title: string;
  content: string;
  rating: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  company: { displayName: string; logoUrl: string | null };
}

export interface AiEntry {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  url: string | null;
}

export interface HomepageRecommendation {
  popularCompanies: Company[];
  popularReviews: RecommendedReview[];
  popularContents: ContentItem[];
  aiEntry: AiEntry;
}
