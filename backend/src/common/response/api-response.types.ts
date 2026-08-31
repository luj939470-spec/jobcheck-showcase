export interface ApiResponseMeta {
  requestId: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  meta: ApiResponseMeta;
}

export interface ResponseEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
