"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <section className="admin-page-header"><div><p className="admin-kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</section>;
}

export function LoadingState({ label = "Loading platform data…" }: { label?: string }) {
  return <div className="admin-state-card"><LoaderCircle className="spin" size={24} /><strong>{label}</strong><p>Please wait while SalonHub prepares the latest information.</p></div>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="admin-state-card"><CheckCircle2 size={24} /><strong>{title}</strong><p>{message}</p></div>;
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="admin-error-banner" role="alert"><AlertCircle size={18} /><span>{message}</span>{onRetry && <button onClick={onRetry}>Try again</button>}</div>;
}

export function Toast({ message, tone, onClose }: { message: string; tone: "success" | "error"; onClose: () => void }) {
  return <div className={`admin-toast ${tone}`} role="status">{tone === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span>{message}</span><button aria-label="Dismiss message" onClick={onClose}><X size={15} /></button></div>;
}

export function RejectSalonDialog({ salonName, busy, onClose, onConfirm }: { salonName: string; busy: boolean; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = reason.trim();
    if (!clean) return setError("A clear rejection reason is required for the salon owner.");
    if (clean.length > 1000) return setError("The rejection reason cannot exceed 1000 characters.");
    setError("");
    await onConfirm(clean);
  }
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="admin-modal-heading"><div><p className="admin-kicker">Moderation decision</p><h2>Reject {salonName}?</h2></div><button type="button" aria-label="Close" onClick={onClose}><X size={18} /></button></div><p>The owner will receive this reason and can correct the salon information before resubmitting.</p><label htmlFor="rejectionReason">Rejection reason</label><textarea id="rejectionReason" value={reason} onChange={(event) => setReason(event.target.value)} rows={5} maxLength={1000} placeholder="Explain exactly what must be corrected…" autoFocus />{error && <span className="admin-field-error">{error}</span>}<div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="admin-danger-button" disabled={busy}>{busy ? "Rejecting…" : "Reject salon"}</button></div></form></div>;
}
