import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token-store";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function findErrorString(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findErrorString(item);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    for (const key of Object.keys(obj)) {
      const found = findErrorString(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, { refresh });
    setTokens(data.access, data.refresh);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && config && !config._retried && !config.url?.includes("/auth/login")) {
      config._retried = true;
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
      const refreshed = await refreshInFlight;
      if (refreshed) return client(config);
      clearTokens();
    }

    const message = findErrorString(error.response?.data) ?? `Request failed with status ${status ?? 0}`;
    throw new ApiError(message, status ?? 0, error.response?.data);
  }
);

export const http = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) => {
    const cleaned = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
        )
      : undefined;
    return client.get<T>(path, { params: cleaned }).then((r) => r.data);
  },
  post: <T>(path: string, body?: unknown) => client.post<T>(path, body).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) => client.patch<T>(path, body).then((r) => r.data),
  delete: <T>(path: string) => client.delete<T>(path).then((r) => r.data),
  postForm: <T>(path: string, body: FormData) =>
    client.post<T>(path, body, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  patchForm: <T>(path: string, body: FormData) =>
    client.patch<T>(path, body, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
};
