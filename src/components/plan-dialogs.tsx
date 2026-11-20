"use client";

import { X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { PLAN_NAMES, day, money } from "@/lib/plan-format";
import type { AdminPlanRequest, AdminSalonPlan, PlanCode } from "@/types/admin";

const MAX_REASON = 500;
const MAX_NOTE = 120;
const MAX_MONTHS = 12;

function DialogFrame({ kicker, title, busy, submitLabel, busyLabel, danger = false, onClose, onSubmit, children }: {
  kicker: string; title: string; busy: boolean; submitLabel: string; busyLabel: string; danger?: boolean;
  onClose: () => void; onSubmit: () => void; children: ReactNode;
}) {
  function submit(event: FormEvent) { event.preventDefault(); if (!busy) onSubmit(); }
  return <div className="admin-modal-backdrop" onKeyDown={(event) => { if (event.key === "Escape" && !busy) onClose(); }}>
    <form className="admin-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal-heading"><div><p className="admin-kicker">{kicker}</p><h2>{title}</h2></div><button type="button" aria-label="Close" onClick={onClose} disabled={busy}><X size={18} /></button></div>
      {children}
      <div className="admin-modal-actions">
        <button type="button" className="admin-secondary-button" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" className={danger ? "admin-danger-button" : "admin-primary-button"} disabled={busy}>{busy ? busyLabel : submitLabel}</button>
      </div>
    </form>
  </div>;
}

/** Last check before the plan turns on: did the money arrive? */
export function ConfirmPaymentDialog({ row, busy, onClose, onConfirm }: { row: AdminPlanRequest; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  const request = row.request;
  return <DialogFrame kicker="Confirm payment" title={`Turn on ${PLAN_NAMES[request.plan]}?`} busy={busy} submitLabel="Payment received" busyLabel="Confirming…" onClose={onClose} onSubmit={onConfirm}>
    <p>Confirm only when you see the money. The owner gets an email and the plan starts at once.</p>
    <dl className="admin-plan-facts">
      <div><dt>Salon</dt><dd>{row.salonName}</dd></div>
      <div><dt>Amount</dt><dd>{money(request.amountFils, request.currency)}, {request.billingCycle === "YEARLY" ? "1 year" : "1 month"}</dd></div>
      <div><dt>Method</dt><dd>{request.method === "CLIQ" ? "CliQ" : "Cash"}</dd></div>
      <div><dt>Reference</dt><dd>{request.reference || "None given"}</dd></div>
    </dl>
    <p className="admin-plan-hint">The same plan continues after the time the salon still has. A different plan starts today.</p>
  </DialogFrame>;
}

/** The owner sees the reason on their plan page and in an email. */
export function RefuseRequestDialog({ row, busy, onClose, onConfirm }: { row: AdminPlanRequest; busy: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  function submit() {
    const clean = reason.trim();
    if (!clean) return setError("Write the reason the owner will see.");
    setError(""); onConfirm(clean);
  }
  return <DialogFrame kicker="Refuse request" title={`Refuse the request of ${row.salonName}?`} busy={busy} danger submitLabel="Refuse request" busyLabel="Refusing…" onClose={onClose} onSubmit={submit}>
    <p>Use this when the payment did not arrive or does not match. The owner can send a new request.</p>
    <label htmlFor="planRefuseReason">Reason</label>
    <textarea id="planRefuseReason" rows={4} maxLength={MAX_REASON} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="For example: we did not receive a CliQ transfer with this reference." autoFocus />
    {error && <span className="admin-field-error">{error}</span>}
  </DialogFrame>;
}

function PlanSelect({ id, value, options, onChange }: { id: string; value: PlanCode; options: PlanCode[]; onChange: (plan: PlanCode) => void }) {
  return <select id={id} className="admin-modal-input" value={value} onChange={(event) => onChange(event.target.value as PlanCode)}>
    {options.map((plan) => <option key={plan} value={plan}>{PLAN_NAMES[plan]}</option>)}
  </select>;
}

/** Free paid-plan time, for example a launch offer or a support gesture. */
export function GrantMonthsDialog({ salon, busy, onClose, onConfirm }: { salon: AdminSalonPlan; busy: boolean; onClose: () => void; onConfirm: (body: { plan: PlanCode; months: number; note: string | null }) => void }) {
  const [plan, setPlan] = useState<PlanCode>(salon.plan === "BUSINESS" ? "BUSINESS" : "PRO");
  const [months, setMonths] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  function submit() {
    const count = Number(months);
    if (!Number.isInteger(count) || count < 1 || count > MAX_MONTHS) return setError(`Give 1 to ${MAX_MONTHS} months.`);
    setError(""); onConfirm({ plan, months: count, note: note.trim() || null });
  }
  return <DialogFrame kicker="Free months" title={`Give ${salon.salonName} free time`} busy={busy} submitLabel="Give free months" busyLabel="Saving…" onClose={onClose} onSubmit={submit}>
    <p>Now on {PLAN_NAMES[salon.plan]}{salon.accessEndsAt ? ` until ${day(salon.accessEndsAt)}` : ""}. The same plan continues after that date; another plan starts today.</p>
    <label htmlFor="planGrantPlan">Plan</label>
    <PlanSelect id="planGrantPlan" value={plan} options={["PRO", "BUSINESS"]} onChange={setPlan} />
    <label htmlFor="planGrantMonths">Months</label>
    <input id="planGrantMonths" className="admin-modal-input" type="number" min={1} max={MAX_MONTHS} inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} />
    <label htmlFor="planGrantNote">Note (optional, the owner sees it)</label>
    <input id="planGrantNote" className="admin-modal-input" type="text" maxLength={MAX_NOTE} value={note} onChange={(event) => setNote(event.target.value)} placeholder="For example: launch offer" />
    {error && <span className="admin-field-error">{error}</span>}
  </DialogFrame>;
}

/** Moves a salon between plans without a payment. */
export function ChangePlanDialog({ salon, busy, onClose, onConfirm }: { salon: AdminSalonPlan; busy: boolean; onClose: () => void; onConfirm: (plan: PlanCode) => void }) {
  const options = (["FREE", "PRO", "BUSINESS"] as PlanCode[]).filter((plan) => plan !== salon.plan);
  const [plan, setPlan] = useState<PlanCode>(options[0]);
  const paidTime = salon.plan !== "FREE";
  return <DialogFrame kicker="Change plan" title={`Change the plan of ${salon.salonName}`} busy={busy} danger={plan === "FREE"} submitLabel={`Move to ${PLAN_NAMES[plan]}`} busyLabel="Saving…" onClose={onClose} onSubmit={() => onConfirm(plan)}>
    <p>Now on {PLAN_NAMES[salon.plan]}{salon.accessEndsAt ? ` until ${day(salon.accessEndsAt)}` : ""}.</p>
    <label htmlFor="planChangePlan">New plan</label>
    <PlanSelect id="planChangePlan" value={plan} options={options} onChange={setPlan} />
    <p className="admin-plan-hint">
      {plan === "FREE"
        ? "The paid or trial time ends now. Limits and locked features apply at once."
        : paidTime
          ? "The end date stays the same. Only the plan changes."
          : "This salon has no paid time. Use Free months or confirm a payment instead."}
    </p>
  </DialogFrame>;
}
