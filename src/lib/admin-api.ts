import type { ApiResponse } from "@/types/admin";

export class AdminApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AdminApiError";
  }
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new AdminApiError("The server returned an unreadable response. Please try again.", response.status);
  }

  if (!response.ok || !payload.success) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.replace("/login");
    }
    throw new AdminApiError(payload.message || "The request could not be completed.", response.status);
  }

  return payload.data;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
