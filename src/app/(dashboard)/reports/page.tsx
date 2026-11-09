"use client";

import { CheckCircle2, ExternalLink, Flag, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Toast } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { ModerationReport, ReportStatus } from "@/types/admin";

type View = "ALL" | ReportStatus;
const titleCase = (value: string) => value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
const targetHref = (report: ModerationReport) => report.targetType === "SALON" ? `/salons/${report.targetId}` : report.targetType === "USER" ? `/people/${report.targetId}` : null;

export default function ReportsPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [view, setView] = useState<View>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setReports(await adminRequest<ModerationReport[]>("reports")); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const visible = useMemo(() => reports.filter((report) => view === "ALL" || report.status === view), [reports, view]);
  async function review(report: ModerationReport, status: "RESOLVED" | "DISMISSED") {
    setBusyId(report.id);
    try {
      await adminRequest<ModerationReport>(`reports/${report.id}`, { method: "PUT", body: JSON.stringify({ status, adminNote: null }) });
      setToast({ message: `Report #${report.id} was ${status.toLowerCase()}.`, tone: "success" });
      await load();
    } catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusyId(null); }
  }
  return <div className="admin-content">
    <PageHeader eyebrow="Trust and safety" title="Community reports" description="Review reported posts, comments, salons, owners, and community members from one moderation queue." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>} />
    {toast && <Toast {...toast} onClose={() => setToast(null)} />}{error && <ErrorBanner message={error} onRetry={() => void load()} />}
    <section className="admin-report-summary"><div><ShieldAlert size={20} /><span><strong>{reports.filter((report) => report.status === "OPEN").length}</strong><small>Open reports</small></span></div><div><CheckCircle2 size={20} /><span><strong>{reports.filter((report) => report.status === "RESOLVED").length}</strong><small>Resolved</small></span></div><div><Flag size={20} /><span><strong>{new Set(reports.filter((report) => report.status === "OPEN").map((report) => `${report.targetType}-${report.targetId}`)).size}</strong><small>Flagged targets</small></span></div></section>
    <div className="admin-tabs">{(["OPEN", "ALL", "RESOLVED", "DISMISSED"] as View[]).map((item) => <button className={view === item ? "is-active" : ""} onClick={() => setView(item)} key={item}>{titleCase(item)}<span>{reports.filter((report) => item === "ALL" || report.status === item).length}</span></button>)}</div>
    {loading ? <LoadingState label="Loading moderation reports…" /> : visible.length === 0 ? <EmptyState title="No reports in this view" message="There are no moderation reports matching this filter." /> : <section className="admin-report-list">{visible.map((report) => {
      const href = targetHref(report);
      return <article className="admin-report-card" key={report.id}>
        <div className="admin-report-icon"><Flag size={18} /></div>
        <div className="admin-report-copy"><div><span className={`admin-status-badge ${report.status.toLowerCase()}`}>{titleCase(report.status)}</span><span className="admin-report-type">{titleCase(report.targetType)}</span><time>{new Date(report.createdAt).toLocaleString()}</time></div><h2>{report.targetLabel}</h2><p><strong>{titleCase(report.reason)}</strong>{report.details ? ` · ${report.details}` : ""}</p><small>Reported by <Link href={`/people/${report.reporter.id}`}>{report.reporter.displayName || report.reporter.userName || `User #${report.reporter.id}`}</Link></small></div>
        <div className="admin-report-actions">{href && <Link className="admin-secondary-button compact" href={href}>Inspect <ExternalLink size={13} /></Link>}{report.status === "OPEN" && <><button className="admin-success-button compact" disabled={busyId === report.id} onClick={() => void review(report, "RESOLVED")}><CheckCircle2 size={14} /> Resolve</button><button className="admin-danger-outline compact" disabled={busyId === report.id} onClick={() => void review(report, "DISMISSED")}><XCircle size={14} /> Dismiss</button></>}</div>
      </article>;
    })}</section>}
  </div>;
}
