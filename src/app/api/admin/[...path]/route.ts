import { cookies } from "next/headers";
import { ADMIN_COOKIE, BACKEND_API_URL, jsonResponse, readBackendResponse } from "@/lib/backend";

const allowedRoutes = [
  { method: "GET", pattern: /^analytics$/ },
  { method: "GET", pattern: /^activity$/ },
  { method: "GET", pattern: /^profile$/ },
  { method: "GET", pattern: /^salons\/(requested|all|active)$/ },
  { method: "GET", pattern: /^salons\/\d+$/ },
  { method: "GET", pattern: /^salons\/\d+\/team$/ },
  { method: "POST", pattern: /^salons\/requested\/(accept|reject)$/ },
  { method: "POST", pattern: /^salons\/\d+\/(block|unblock)$/ },
  { method: "GET", pattern: /^users\/(all|active|blocked)$/ },
  { method: "GET", pattern: /^users\/\d+$/ },
  { method: "POST", pattern: /^users\/\d+\/(block|unblock)$/ },
];

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const route = (await context.params).path.join("/");
  if (!allowedRoutes.some(({ method, pattern }) => method === request.method && pattern.test(route))) {
    return jsonResponse({ success: false, message: "This admin operation is not available.", data: null }, 404);
  }

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) {
    return jsonResponse({ success: false, message: "Your admin session is missing or expired. Please sign in again.", data: null }, 401);
  }

  const body = request.method === "GET" ? undefined : await request.text();
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/dashboard/${route}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body || undefined,
      cache: "no-store",
    });
    const payload = await readBackendResponse<unknown>(response);
    if (response.status === 401 || response.status === 403) {
      (await cookies()).delete(ADMIN_COOKIE);
    }
    return jsonResponse(payload, response.status);
  } catch {
    return jsonResponse({ success: false, message: "Cannot connect to the SalonHub backend. Confirm it is running and try again.", data: null }, 503);
  }
}

export const GET = proxy;
export const POST = proxy;
