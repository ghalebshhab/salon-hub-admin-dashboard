import { cookies } from "next/headers";
import { ADMIN_COOKIE, BACKEND_API_URL, jsonResponse } from "@/lib/backend";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      await fetch(`${BACKEND_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // Local logout must still complete if the backend is temporarily unavailable.
    }
  }
  cookieStore.delete(ADMIN_COOKIE);
  return jsonResponse({ success: true, message: "Signed out successfully.", data: null });
}
