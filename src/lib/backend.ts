import type { ApiResponse } from "@/types/admin";

export const ADMIN_COOKIE = "salon_hub_admin_token";
export const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:8081").replace(/\/$/, "");

export async function readBackendResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: response.ok
        ? "The backend returned an unreadable response."
        : `The backend request failed (${response.status}).`,
      data: null as T,
    };
  }
}

export function jsonResponse<T>(payload: ApiResponse<T>, status = 200): Response {
  return Response.json(payload, { status });
}

export const sessionCookie = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
};
