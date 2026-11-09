"use client";

import { Flag, ShieldCheck, Store, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorBanner, LoadingState, PageHeader } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { AdminUser, ModerationReport, Salon } from "@/types/admin";

export default function OverviewPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [salonData, userData, reportData] = await Promise.all([
        adminRequest<Salon[]>("salons/all"),
        adminRequest<AdminUser[]>("users/all"),
        adminRequest<ModerationReport[]>("reports"),
      ]);
      setSalons(salonData); setUsers(userData); setReports(reportData);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const pending = salons.filter((salon) => salon.status === "Requested");
  const blockedSalons = salons.filter((salon) => salon.blockedByAdmin || salon.blockedByOwner);
  const blockedUsers = users.filter((user) => user.status === "Blocked");
  const openReports = reports.filter((report) => report.status === "OPEN");

  return <div className="admin-content"><PageHeader eyebrow="Platform overview" title="Good to see you, Admin." description="Live operational data from the SalonHub backend." />{error && <ErrorBanner message={error} onRetry={() => void load()} />}{loading ? <LoadingState /> : <><section className="admin-stat-grid"><Metric icon={Store} label="Total salons" value={salons.length} detail={`${salons.filter((salon) => salon.status === "Accepted").length} accepted`} tone="plum" /><Metric icon={UsersRound} label="Registered users" value={users.length} detail={`${users.filter((user) => user.status === "Active").length} active`} tone="blue" /><Metric icon={ShieldCheck} label="Pending approvals" value={pending.length} detail="Require admin review" tone="gold" /><Metric icon={Flag} label="Open reports" value={openReports.length} detail="Trust and safety queue" tone="lilac" /></section><section className="admin-main-grid"><article className="admin-panel admin-overview-list"><div className="admin-panel-heading"><div><h2>Pending salon approvals</h2><p>Newest requests that need a decision</p></div><Link className="admin-text-button" href="/salons?view=requested">View all</Link></div>{pending.length ? pending.slice(0, 5).map((salon) => <div className="admin-overview-row" key={salon.id}><span className="admin-list-avatar">{salon.name.slice(0, 1).toUpperCase()}</span><div><strong>{salon.name}</strong><p>{salon.ownerName ?? "Unknown owner"} · {salon.location ?? "Location not provided"}</p></div><Link href={`/salons?focus=${salon.id}`}>Review</Link></div>) : <p className="admin-inline-empty">No salon requests are waiting for review.</p>}</article><article className="admin-panel admin-health-card"><ShieldCheck size={22} /><p className="admin-kicker">Moderation health</p><h2>{openReports.length === 0 ? "Everything looks clear." : `${openReports.length} reports need review.`}</h2><p>{blockedUsers.length} blocked users, {blockedSalons.length} blocked salons, and {openReports.length} open community reports.</p><Link href="/reports">Open moderation queue</Link></article></section></>}</div>;
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Store; label: string; value: number; detail: string; tone: string }) {
  return <article className="admin-stat-card"><div className={`admin-stat-icon ${tone}`}><Icon size={18} /></div><div className="admin-stat-copy"><p>{label}</p><strong>{value.toLocaleString()}</strong><span>{detail}</span></div></article>;
}
