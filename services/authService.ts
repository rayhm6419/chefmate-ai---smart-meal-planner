import { apiFetchJson } from "./apiClient";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  return apiFetchJson<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    { skipAuth: true }
  );
};

export const registerRequest = async (email: string, password: string): Promise<AuthResponse> => {
  return apiFetchJson<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    { skipAuth: true }
  );
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  return apiFetchJson<AuthUser>("/auth/me", { method: "GET" });
};
