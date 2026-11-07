"use client";

import { BarChart3, CalendarCheck, CircleDollarSign, RefreshCw, Store, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBanner, LoadingState, PageHeader } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { AdminAnalytics } from "@/types/admin";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setAnalytics(await adminRequest<AdminAnalytics>("analytics")); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const maximumBookings = useMemo(() => Math.max(1, ...(analytics?.monthlyTrend.map((point) => point.bookings) ?? [])), [analytics]);

  return <div className="admin-content"><PageHeader eyebrow="Platform intelligence" title="Analytics" description="Real operational and booking metrics calculated from SalonHub’s persisted data." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>} />{error && <ErrorBanner message={error} onRetry={() => void load()} />}{loading || !analytics ? <LoadingState label="Calculating analytics…" /> : <><section className="admin-stat-grid"><Metric icon={UsersRound} label="Users" value={analytics.totalUsers.toLocaleString()} detail={`${analytics.activeUsers} active · ${analytics.blockedUsers} blocked`} tone="blue" /><Metric icon={Store} label="Salons" value={analytics.totalSalons.toLocaleString()} detail={`${analytics.acceptedSalons} accepted · ${analytics.requestedSalons} pending`} tone="plum" /><Metric icon={CalendarCheck} label="Bookings" value={analytics.totalBookings.toLocaleString()} detail={`${analytics.completedBookings} completed`} tone="lilac" /><Metric icon={CircleDollarSign} label="Completed value" value={money(analytics.completedBookingValue)} detail={`${money(analytics.grossBookingValue)} total booked`} tone="gold" /></section><section className="admin-analytics-grid"><article className="admin-panel admin-trend-panel"><div className="admin-panel-heading"><div><h2>Six-month booking trend</h2><p>Created bookings and completed outcomes</p></div><BarChart3 size={18} /></div><div className="admin-trend-chart">{analytics.monthlyTrend.map((point) => <div className="admin-trend-column" key={point.month}><div className="admin-trend-bars"><span className="gross" style={{ height: `${Math.max(5, (point.bookings / maximumBookings) * 100)}%` }} title={`${point.bookings} bookings`} /><span className="complete" style={{ height: `${Math.max(3, (point.completedBookings / maximumBookings) * 100)}%` }} title={`${point.completedBookings} completed`} /></div><strong>{point.bookings}</strong><small>{point.month}</small></div>)}</div><div className="admin-chart-legend"><span><i className="gross" />Bookings</span><span><i className="complete" />Completed</span></div></article><article className="admin-panel admin-breakdown-panel"><div className="admin-panel-heading"><div><h2>Booking outcomes</h2><p>Current distribution by status</p></div></div><Breakdown label="Completed" value={analytics.completedBookings} total={analytics.totalBookings} tone="green" /><Breakdown label="Accepted" value={analytics.acceptedBookings} total={analytics.totalBookings} tone="plum" /><Breakdown label="Pending" value={analytics.pendingBookings} total={analytics.totalBookings} tone="gold" /><Breakdown label="Rejected" value={analytics.rejectedBookings} total={analytics.totalBookings} tone="red" /><Breakdown label="Cancelled" value={analytics.cancelledBookings} total={analytics.totalBookings} tone="muted" /></article></section><section className="admin-analytics-grid admin-analytics-secondary"><article className="admin-panel admin-breakdown-panel"><div className="admin-panel-heading"><div><h2>Salon lifecycle</h2><p>Moderation and availability status</p></div></div><Breakdown label="Accepted" value={analytics.acceptedSalons} total={analytics.totalSalons} tone="green" /><Breakdown label="Requested" value={analytics.requestedSalons} total={analytics.totalSalons} tone="gold" /><Breakdown label="Rejected" value={analytics.rejectedSalons} total={analytics.totalSalons} tone="red" /><Breakdown label="Inactive" value={analytics.inactiveSalons} total={analytics.totalSalons} tone="muted" /></article><article className="admin-panel admin-insight-card"><p className="admin-kicker">Community composition</p><h2>{analytics.owners} owners and {analytics.employees} employees</h2><p>{analytics.careerProfiles} users have enabled a career profile. {analytics.blockedSalons} salons and {analytics.blockedUsers} users are currently restricted.</p><small>Updated {new Date(analytics.generatedAt).toLocaleString()}</small></article></section></>}</div>;
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Store; label: string; value: string; detail: string; tone: string }) { return <article className="admin-stat-card"><div className={`admin-stat-icon ${tone}`}><Icon size={18} /></div><div className="admin-stat-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>; }
function Breakdown({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) { const percentage = total ? Math.round((value / total) * 100) : 0; return <div className="admin-breakdown-row"><div><strong>{label}</strong><span>{value.toLocaleString()} · {percentage}%</span></div><div className="admin-progress"><i className={tone} style={{ width: `${percentage}%` }} /></div></div>; }
function money(value: number) { return new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD", maximumFractionDigits: 2 }).format(value); }
