import { cookies } from "next/headers";
import { ADMIN_COOKIE, BACKEND_API_URL, jsonResponse, readBackendResponse, sessionCookie } from "@/lib/backend";

type LoginData = { token: string; type: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.adminEmail || !body?.adminPassword) {
    return jsonResponse({ success: false, message: "Email and password are required.", data: null }, 400);
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/dashboard/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await readBackendResponse<LoginData>(response);
    if (response.ok && payload.success && payload.data?.token) {
      (await cookies()).set(ADMIN_COOKIE, payload.data.token, sessionCookie);
    }
    return jsonResponse(payload, response.status);
  } catch {
    return jsonResponse({ success: false, message: "Cannot connect to the SalonHub backend. Confirm it is running and try again.", data: null }, 503);
  }
}
