"use client";

import { Ban, BriefcaseBusiness, RefreshCw, UserCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Toast } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { AdminUser } from "@/types/admin";

type View = "all" | "active" | "blocked";

export default function UsersPage() {
  const params = useSearchParams();
  const initial = params.get("view");
  const [view, setView] = useState<View>(initial === "active" || initial === "blocked" ? initial : "all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const load = useCallback(async () => { setLoading(true); setError(""); try { setUsers(await adminRequest<AdminUser[]>("users/all")); } catch (requestError) { setError(errorMessage(requestError)); } finally { setLoading(false); } }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const visible = useMemo(() => users.filter((user) => view === "all" || user.status.toLowerCase() === view), [users, view]);

  async function changeAccess(user: AdminUser) {
    const operation = user.status === "Blocked" ? "unblock" : "block";
    setBusyId(user.id);
    try { await adminRequest(`users/${user.id}/${operation}`, { method: "POST" }); setToast({ message: `${user.userName ?? user.email} was ${operation}ed.`, tone: "success" }); await load(); }
    catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusyId(null); }
  }

  return <div className="admin-content"><PageHeader eyebrow="Account management" title="Users" description="Inspect roles, career profiles, salon relationships, and account status." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>} />{toast && <Toast {...toast} onClose={() => setToast(null)} />}{error && <ErrorBanner message={error} onRetry={() => void load()} />}<div className="admin-tabs">{(["all", "active", "blocked"] as View[]).map((item) => <button className={view === item ? "is-active" : ""} onClick={() => setView(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}<span>{users.filter((user) => item === "all" || user.status.toLowerCase() === item).length}</span></button>)}</div>{loading ? <LoadingState label="Loading users…" /> : visible.length === 0 ? <EmptyState title="No users in this view" message="There are currently no user accounts matching this filter." /> : <div className="admin-table-card"><div className="admin-table-wrap"><table className="admin-data-table"><thead><tr><th>User</th><th>Role</th><th>Salon</th><th>Career profile</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((user) => <tr key={user.id}><td><div className="admin-user-cell"><span>{(user.firstName?.[0] ?? user.userName?.[0] ?? user.email[0]).toUpperCase()}</span><div><strong>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.userName || "Unnamed user"}</strong><small>{user.email}</small></div></div></td><td><span className="admin-role"><BriefcaseBusiness size={13} /> {user.role}</span></td><td>{user.salonName ?? "—"}</td><td>{user.careerProfileEnabled ? "Enabled" : "Not enabled"}</td><td><span className={`admin-status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td><td>{user.role === "ADMIN" ? <span className="admin-protected-label">Protected admin</span> : <button className={user.status === "Blocked" ? "admin-success-button compact" : "admin-danger-outline compact"} disabled={busyId === user.id} onClick={() => void changeAccess(user)}>{user.status === "Blocked" ? <><UserCheck size={14} /> Unblock</> : <><Ban size={14} /> Block</>}</button>}</td></tr>)}</tbody></table></div></div>}</div>;
}
