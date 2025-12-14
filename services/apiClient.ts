import { API_BASE_URL } from "../config/env";

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void | Promise<void>;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const configureApiClient = (provider: TokenProvider, onUnauthorized?: UnauthorizedHandler) => {
  tokenProvider = provider;
  unauthorizedHandler = onUnauthorized || null;
};

interface RequestConfig {
  skipAuth?: boolean;
}

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<Response> => {
  const headers = new Headers(options.headers || {});
  const token = tokenProvider();
  if (!config.skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && unauthorizedHandler) {
    await unauthorizedHandler();
  }

  return response;
};

export const apiFetchJson = async <T>(
  path: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<T> => {
  const res = await apiFetch(path, options, config);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
};
