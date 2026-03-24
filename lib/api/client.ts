import { config } from "@/lib/config";
import type { ApiResponse } from "./types/common";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function getTokens() {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  }
  return { accessToken, refreshToken };
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken: rt } = getTokens();
  if (!rt) return false;

  try {
    const res = await fetch(`${config.apiUrl}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: rt }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const data = await res.json();
    setTokens(data.data.access, data.data.refresh ?? rt);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, headers = {}, isFormData } = options;

  const { accessToken: token } = getTokens();

  const url = new URL(`${config.apiUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const requestHeaders: Record<string, string> = { ...headers };
  if (token) requestHeaders["Authorization"] = `Bearer ${token}`;
  if (!isFormData) requestHeaders["Content-Type"] = "application/json";

  let requestBody: BodyInit | undefined;
  if (body) {
    requestBody = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  let res = await fetch(url.toString(), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  if (res.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const { accessToken: newToken } = getTokens();
      requestHeaders["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: requestBody,
      });
    }
  }

  const json = await res.json();
  return json as ApiResponse<T>;
}
