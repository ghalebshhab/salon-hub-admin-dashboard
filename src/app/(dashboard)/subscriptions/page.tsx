"use client";

import { CheckCircle2, Clock3, Crown, Gift, Hourglass, RefreshCw, Repeat2, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Toast } from "@/components/admin-ui";
import { ConfirmPaymentDialog, GrantMonthsDialog, ChangePlanDialog, RefuseRequestDialog } from "@/components/plan-dialogs";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import { PLAN_NAMES, day, money } from "@/lib/plan-format";
import type { AdminPlanRequest, AdminSalonPlan, PlanPaymentMethod, PlanPaymentStatus, SubscriptionStatus } from "@/types/admin";

type View = "WAITING" | "SALONS" | "HISTORY";
type Dialog =
  | { kind: "confirm"; row: AdminPlanRequest }
  | { kind: "refuse"; row: AdminPlanRequest }
  | { kind: "grant"; salon: AdminSalonPlan }
  | { kind: "change"; salon: AdminSalonPlan }
  | null;

const METHOD_NAMES: Record<PlanPaymentMethod, string> = { CLIQ: "CliQ", CASH: "Cash", COMPLIMENTARY: "Free months" };
const STATUS_NAMES: Record<SubscriptionStatus, string> = { TRIAL: "Trial", ACTIVE: "Active", GRACE: "Payment due", ENDED: "Free" };
const REQUEST_NAMES: Record<PlanPaymentStatus, string> = { PENDING: "Waiting", CONFIRMED: "Confirmed", REJECTED: "Refused", CANCELLED: "Cancelled" };
const STATUS_TONE: Record<SubscriptionStatus, string> = { TRIAL: "requested", ACTIVE: "accepted", GRACE: "rejected", ENDED: "" };
const REQUEST_TONE: Record<PlanPaymentStatus, string> = { PENDING: "requested", CONFIRMED: "accepted", REJECTED: "rejected", CANCELLED: "" };

const cycleName = (cycle: string | null) => cycle === "YEARLY" ? "yearly" : "monthly";

export default function SubscriptionsPage() {
  const [view, setView] = useState<View>("WAITING");
  const [waiting, setWaiting] = useState<AdminPlanRequest[]>([]);
  const [salons, setSalons] = useState<AdminSalonPlan[]>([]);
  const [history, setHistory] = useState<AdminPlanRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [requests, salonPlans] = await Promise.all([
        adminRequest<AdminPlanRequest[]>("subscriptions/requests"),
        adminRequest<AdminSalonPlan[]>("subscriptions/salons"),
      ]);
      setWaiting(requests); setSalons(salonPlans); setHistory(null);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  // History loads the first time the tab opens, and again after any change.
  useEffect(() => {
    if (view !== "HISTORY" || history !== null) return;
    let active = true;
    adminRequest<AdminPlanRequest[]>("subscriptions/requests/history")
      .then((rows) => { if (active) setHistory(rows); })
      .catch((requestError) => { if (active) { setHistory([]); setToast({ message: errorMessage(requestError), tone: "error" }); } });
    return () => { active = false; };
  }, [view, history]);

  const counts = useMemo(() => ({
    pro: salons.filter((salon) => salon.plan === "PRO").length,
    business: salons.filter((salon) => salon.plan === "BUSINESS").length,
    endingSoon: salons.filter((salon) => salon.daysLeft != null && salon.daysLeft <= 7 && salon.plan !== "FREE").length,
  }), [salons]);

  async function run(path: string, body: unknown, done: string) {
    setBusy(true);
    try {
      await adminRequest<unknown>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
      setDialog(null);
      setToast({ message: done, tone: "success" });
      await load();
    } catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusy(false); }
  }

  return <div className="admin-content">
    <PageHeader eyebrow="Billing" title="Salon plans" description="Confirm owner payments, give free months and move salons between Free, Pro and Business." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>} />
    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    {error && <ErrorBanner message={error} onRetry={() => void load()} />}

    <section className="admin-report-summary">
      <div><Clock3 size={20} /><span><strong>{waiting.length}</strong><small>Waiting requests</small></span></div>
      <div><Crown size={20} /><span><strong>{counts.pro} / {counts.business}</strong><small>Salons on Pro / Business</small></span></div>
      <div><Hourglass size={20} /><span><strong>{counts.endingSoon}</strong><small>Paid or trial time ends in 7 days</small></span></div>
    </section>

    <div className="admin-tabs" role="tablist">
      {([["WAITING", "Waiting", waiting.length], ["SALONS", "Salons", salons.length], ["HISTORY", "History", history?.length ?? null]] as [View, string, number | null][]).map(([key, label, count]) =>
        <button key={key} role="tab" aria-selected={view === key} className={view === key ? "is-active" : ""} onClick={() => setView(key)}>{label}{count != null && <span>{count}</span>}</button>)}
    </div>

    {loading ? <LoadingState label="Loading salon plans…" />
      : view === "WAITING" ? <WaitingList rows={waiting} busy={busy} onConfirm={(row) => setDialog({ kind: "confirm", row })} onRefuse={(row) => setDialog({ kind: "refuse", row })} />
      : view === "SALONS" ? <SalonTable salons={salons} onGrant={(salon) => setDialog({ kind: "grant", salon })} onChange={(salon) => setDialog({ kind: "change", salon })} />
      : history === null ? <LoadingState label="Loading request history…" />
      : <HistoryTable rows={history} />}

    {dialog?.kind === "confirm" && <ConfirmPaymentDialog row={dialog.row} busy={busy} onClose={() => setDialog(null)}
      onConfirm={() => run(`subscriptions/requests/${dialog.row.request.id}/confirm`, null, `${PLAN_NAMES[dialog.row.request.plan]} is on for ${dialog.row.salonName}.`)} />}
    {dialog?.kind === "refuse" && <RefuseRequestDialog row={dialog.row} busy={busy} onClose={() => setDialog(null)}
      onConfirm={(reason) => run(`subscriptions/requests/${dialog.row.request.id}/reject`, { reason }, `The request of ${dialog.row.salonName} was refused.`)} />}
    {dialog?.kind === "grant" && <GrantMonthsDialog salon={dialog.salon} busy={busy} onClose={() => setDialog(null)}
      onConfirm={(body) => run(`subscriptions/salons/${dialog.salon.salonId}/grant`, body, `${dialog.salon.salonName} received ${body.months} free ${body.months === 1 ? "month" : "months"}.`)} />}
    {dialog?.kind === "change" && <ChangePlanDialog salon={dialog.salon} busy={busy} onClose={() => setDialog(null)}
      onConfirm={(plan) => run(`subscriptions/salons/${dialog.salon.salonId}/plan`, { plan }, `${dialog.salon.salonName} is now on ${PLAN_NAMES[plan]}.`)} />}
  </div>;
}

function WaitingList({ rows, busy, onConfirm, onRefuse }: { rows: AdminPlanRequest[]; busy: boolean; onConfirm: (row: AdminPlanRequest) => void; onRefuse: (row: AdminPlanRequest) => void }) {
  if (!rows.length) return <EmptyState title="No requests waiting" message="New owner requests for Pro or Business appear here." />;
  return <section className="admin-report-list">{rows.map((row) => {
    const request = row.request;
    return <article className="admin-report-card" key={request.id}>
      <div className="admin-report-icon"><Crown size={18} /></div>
      <div className="admin-report-copy">
        <div><span className="admin-status-badge requested">Waiting</span><span className="admin-report-type">{METHOD_NAMES[request.method]}</span><time>{new Date(request.createdAt).toLocaleString()}</time></div>
        <h2><Link href={`/salons/${row.salonId}`}>{row.salonName}</Link>: {PLAN_NAMES[request.plan]}, {cycleName(request.billingCycle)}</h2>
        <p><strong>{money(request.amountFils, request.currency)}</strong>{request.reference ? ` · Reference: ${request.reference}` : " · No reference"} · Now on {PLAN_NAMES[row.currentPlan]}</p>
        <small>{row.ownerName}{row.ownerPhone ? ` · ${row.ownerPhone}` : ""}{row.ownerEmail ? ` · ${row.ownerEmail}` : ""}</small>
      </div>
      <div className="admin-report-actions">
        <button className="admin-success-button compact" disabled={busy} onClick={() => onConfirm(row)}><CheckCircle2 size={14} /> Confirm payment</button>
        <button className="admin-danger-outline compact" disabled={busy} onClick={() => onRefuse(row)}><XCircle size={14} /> Refuse</button>
      </div>
    </article>;
  })}</section>;
}

function SalonTable({ salons, onGrant, onChange }: { salons: AdminSalonPlan[]; onGrant: (salon: AdminSalonPlan) => void; onChange: (salon: AdminSalonPlan) => void }) {
  if (!salons.length) return <EmptyState title="No approved salons" message="Approved salons and their plans appear here." />;
  return <section className="admin-table-card"><div className="admin-table-scroll" style={{ overflowX: "auto" }}><table className="admin-data-table">
    <thead><tr><th>Salon</th><th>Plan</th><th>Status</th><th>Ends</th><th>Request</th><th><span className="sr-only">Actions</span></th></tr></thead>
    <tbody>{salons.map((salon) => <tr key={salon.salonId}>
      <td><div className="admin-user-cell"><span>{salon.salonName?.[0] ?? "S"}</span><div><strong><Link href={`/salons/${salon.salonId}`}>{salon.salonName}</Link></strong><small>{salon.ownerName}</small></div></div></td>
      <td><span className={`admin-plan-badge plan-${salon.plan.toLowerCase()}`}>{PLAN_NAMES[salon.plan]}</span></td>
      <td><span className={`admin-status-badge ${STATUS_TONE[salon.status]}`}>{STATUS_NAMES[salon.status]}</span>{salon.billingCycle && salon.status === "ACTIVE" && <small className="admin-muted-note"> {cycleName(salon.billingCycle)}</small>}</td>
      <td>{salon.accessEndsAt ? <>{day(salon.accessEndsAt)}<small className="admin-muted-note"> · {salon.daysLeft} {salon.daysLeft === 1 ? "day" : "days"}</small></> : "—"}</td>
      <td>{salon.openRequest ? <span className="admin-status-badge requested">Waiting</span> : "—"}</td>
      <td><div className="admin-row-actions">
        <button className="admin-secondary-button compact" onClick={() => onGrant(salon)}><Gift size={13} /> Free months</button>
        <button className="admin-secondary-button compact" onClick={() => onChange(salon)}><Repeat2 size={13} /> Change plan</button>
      </div></td>
    </tr>)}</tbody>
  </table></div></section>;
}

function HistoryTable({ rows }: { rows: AdminPlanRequest[] }) {
  if (!rows.length) return <EmptyState title="No requests yet" message="Plan requests and free months appear here." />;
  return <section className="admin-table-card"><div style={{ overflowX: "auto" }}><table className="admin-data-table">
    <thead><tr><th>Date</th><th>Salon</th><th>Plan</th><th>Amount</th><th>Method</th><th>Result</th><th>Paid until</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.request.id}>
      <td>{day(row.request.createdAt)}</td>
      <td><Link href={`/salons/${row.salonId}`}>{row.salonName}</Link></td>
      <td>{PLAN_NAMES[row.request.plan]}, {cycleName(row.request.billingCycle)}</td>
      <td>{money(row.request.amountFils, row.request.currency)}</td>
      <td>{METHOD_NAMES[row.request.method]}{row.request.reference ? <small className="admin-muted-note"> · {row.request.reference}</small> : null}</td>
      <td><span className={`admin-status-badge ${REQUEST_TONE[row.request.status]}`} title={row.request.rejectionReason ?? undefined}>{REQUEST_NAMES[row.request.status]}</span></td>
      <td>{day(row.request.periodEnd)}</td>
    </tr>)}</tbody>
  </table></div></section>;
}
