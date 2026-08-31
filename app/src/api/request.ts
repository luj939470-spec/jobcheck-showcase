import type { ApiEnvelope } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1").replace(
  /\/$/,
  "",
);
const TOKEN_KEY = "jobcheck_access_token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "REQUEST_FAILED",
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  const token = tokenStorage.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("无法连接服务器，请检查后端服务是否已启动。", 0, "NETWORK_ERROR");
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { error?: { message?: string; code?: string; requestId?: string } }
    | null;

  if (!response.ok) {
    const error = payload && "error" in payload ? payload.error : undefined;
    if (response.status === 401) tokenStorage.clear();
    throw new ApiError(
      error?.message ?? `请求失败（${response.status}）`,
      response.status,
      error?.code,
      error?.requestId,
    );
  }

  return payload as ApiEnvelope<T>;
}
