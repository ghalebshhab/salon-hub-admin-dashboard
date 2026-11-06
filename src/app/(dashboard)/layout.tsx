import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ADMIN_COOKIE, BACKEND_API_URL, readBackendResponse } from "@/lib/backend";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) redirect("/login");

  let isAdmin = false;
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/dashboard/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const payload = await readBackendResponse<{ role: string }>(response);
    isAdmin = response.ok && payload.success && payload.data?.role === "ADMIN";
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) redirect("/login");

  return <AdminShell>{children}</AdminShell>;
}
