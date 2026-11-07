"use client";

import { Activity, CalendarDays, Clock3, Eye, RefreshCw, UserCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { UserActivity, UserActivityDashboard } from "@/types/admin";

type Period = "today" | "week" | "month" | "year";
type Presence = "all" | "online" | "offline";

const periods: Array<{ id: Period; label: string }> = [
  { id: "today", label: "Daily" }, { id: "week", label: "Weekly" }, { id: "month", label: "Monthly" }, { id: "year", label: "Yearly" },
];

export default function UserActivityPage() {
  const [data, setData] = useState<UserActivityDashboard | null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [presence, setPresence] = useState<Presence>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await adminRequest<UserActivityDashboard>("activity")); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const users = useMemo(() => (data?.users ?? []).filter((user) => presence === "all" || (presence === "online" ? user.online : !user.online)), [data, presence]);
  const usage = (user: UserActivity) => period === "today" ? user.activityToday : period === "week" ? user.activityThisWeek : period === "month" ? user.activityThisMonth : user.activityThisYear;
  const logins = (user: UserActivity) => period === "today" ? user.loginsToday : period === "week" ? user.loginsThisWeek : period === "month" ? user.loginsThisMonth : user.loginsThisYear;

  return <div className="admin-content">
    <PageHeader eyebrow="Engagement and presence" title="User Activity" description="Monitor successful logins, recent application usage, last-seen time, and online presence across every account." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh activity</button>} />
    {error && <ErrorBanner message={error} onRetry={() => void load()} />}
    {loading || !data ? <LoadingState label="Loading user activity…" /> : <>
      <section className="admin-stat-grid admin-activity-stats">
        <ActivityStat icon={UsersRound} label="All accounts" value={data.totalUsers} detail="Tracked users" tone="plum" />
        <ActivityStat icon={UserCheck} label="Online now" value={data.onlineUsers} detail="Active in the last 5 minutes" tone="green" />
        <ActivityStat icon={Clock3} label="Active today" value={data.activeToday} detail="Users with activity today" tone="blue" />
        <ActivityStat icon={CalendarDays} label="Active this month" value={data.activeThisMonth} detail={`${data.activeThisWeek} active this week`} tone="gold" />
      </section>
      <section className="admin-activity-controls">
        <div className="admin-tabs">{periods.map((item) => <button className={period === item.id ? "is-active" : ""} key={item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div>
        <div className="admin-presence-filter">{(["all", "online", "offline"] as Presence[]).map((item) => <button className={presence === item ? "is-active" : ""} key={item} onClick={() => setPresence(item)}>{item === "all" ? "All users" : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      </section>
      <p className="admin-activity-note">Usage is recorded as authenticated activity signals, sampled at most once per minute to protect database performance. Historical reporting begins when this feature is enabled.</p>
      {users.length === 0 ? <EmptyState title="No users in this view" message="No accounts match the selected presence filter." /> : <div className="admin-table-card"><div className="admin-table-wrap"><table className="admin-data-table admin-activity-table">
        <thead><tr><th>User</th><th>Presence</th><th>Last used</th><th>Last login</th><th>{periods.find((item) => item.id === period)?.label} usage</th><th>Logins</th><th>Total logins</th><th><span className="sr-only">Profile</span></th></tr></thead>
        <tbody>{users.map((user) => <tr key={user.userId}><td><div className="admin-user-cell"><span>{(user.fullName?.[0] ?? user.userName?.[0] ?? user.email[0]).toUpperCase()}</span><div><Link className="admin-profile-name-link" href={`/people/${user.userId}`}><strong>{user.fullName || user.userName || "Unnamed user"}</strong></Link><small>{user.email} · {user.role}</small></div></div></td><td><span className={`admin-presence ${user.online ? "online" : "offline"}`}><i />{user.online ? "Online" : "Offline"}</span></td><td><TimeValue value={user.lastActivityAt} /></td><td><TimeValue value={user.lastLoginAt} /></td><td><strong className="admin-usage-value">{usage(user)}</strong> signals</td><td>{logins(user)}</td><td>{user.totalLogins}</td><td><Link className="admin-secondary-button compact" href={`/people/${user.userId}`}><Eye size={13} /> Profile</Link></td></tr>)}</tbody>
      </table></div></div>}
    </>}
  </div>;
}

function ActivityStat({ icon: Icon, label, value, detail, tone }: { icon: typeof Activity; label: string; value: number; detail: string; tone: string }) { return <article className="admin-stat-card"><div className={`admin-stat-icon ${tone}`}><Icon size={17} /></div><div className="admin-stat-copy"><p>{label}</p><strong>{value.toLocaleString()}</strong><span>{detail}</span></div></article>; }
function TimeValue({ value }: { value: string | null }) { if (!value) return <span className="admin-never-used">Never</span>; const date = new Date(value); return <time title={date.toLocaleString()} dateTime={value}>{relativeTime(date)}</time>; }
function relativeTime(date: Date) { const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000)); if (seconds < 60) return "Just now"; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; const days = Math.floor(hours / 24); if (days < 30) return `${days}d ago`; return date.toLocaleDateString(); }
