"use client";

import { Ban, Check, MapPin, RefreshCw, Store, UsersRound, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, RejectSalonDialog, Toast } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { Salon } from "@/types/admin";

type View = "all" | "requested" | "active" | "blocked";

export default function SalonsPage() {
  const params = useSearchParams();
  const initial = params.get("view");
  const [view, setView] = useState<View>(initial === "requested" || initial === "active" || initial === "blocked" ? initial : "all");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<Salon | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setSalons(await adminRequest<Salon[]>("salons/all")); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => salons.filter((salon) => view === "all" || (view === "requested" && salon.status === "Requested") || (view === "active" && salon.status === "Accepted" && !salon.blockedByAdmin && !salon.blockedByOwner) || (view === "blocked" && (salon.blockedByAdmin || salon.blockedByOwner))), [salons, view]);

  async function action(salon: Salon, operation: "accept" | "block" | "unblock", body?: object) {
    setBusyId(salon.id);
    try {
      await adminRequest(operation === "accept" ? "salons/requested/accept" : `salons/${salon.id}/${operation}`, { method: "POST", body: body ? JSON.stringify(body) : operation === "accept" ? JSON.stringify({ salonId: salon.id }) : undefined });
      setToast({ message: operation === "accept" ? `${salon.name} was approved.` : `${salon.name} was ${operation}ed.`, tone: "success" });
      await load();
    } catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusyId(null); }
  }

  async function reject(reason: string) {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await adminRequest("salons/requested/reject", { method: "POST", body: JSON.stringify({ salonId: rejecting.id, rejectionReason: reason }) });
      setToast({ message: `${rejecting.name} was rejected and the owner was notified.`, tone: "success" }); setRejecting(null); await load();
    } catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusyId(null); }
  }

  return <div className="admin-content"><PageHeader eyebrow="Salon moderation" title="Salons" description="Review creation requests and manage every salon’s platform access." action={<button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>} />{toast && <Toast {...toast} onClose={() => setToast(null)} />}{error && <ErrorBanner message={error} onRetry={() => void load()} />}<div className="admin-tabs">{(["all", "requested", "active", "blocked"] as View[]).map((item) => <button className={view === item ? "is-active" : ""} onClick={() => setView(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}<span>{salons.filter((salon) => item === "all" || (item === "requested" && salon.status === "Requested") || (item === "active" && salon.status === "Accepted" && !salon.blockedByAdmin && !salon.blockedByOwner) || (item === "blocked" && (salon.blockedByAdmin || salon.blockedByOwner))).length}</span></button>)}</div>{loading ? <LoadingState label="Loading salons…" /> : visible.length === 0 ? <EmptyState title="No salons in this view" message="There are currently no salon records matching this filter." /> : <div className="admin-card-grid">{visible.map((salon) => <article className="admin-entity-card" key={salon.id}><div className="admin-entity-heading"><span className="admin-list-avatar"><Store size={18} /></span><div><h2>{salon.name}</h2><p><MapPin size={13} /> {salon.location ?? "Location not provided"}</p></div><Status value={salon.blockedByAdmin ? "Blocked" : salon.status} /></div><dl><div><dt>Owner</dt><dd>{salon.ownerName ?? "Not available"}</dd></div><div><dt>Contact</dt><dd>{salon.email ?? salon.salonPhoneNumber ?? "Not available"}</dd></div><div><dt>Team</dt><dd><UsersRound size={13} /> {salon.currentEmployeesNumber ?? 0} / {salon.maxEmployeesNumber ?? "—"}</dd></div><div><dt>Created</dt><dd>{salon.createdAt ?? "Not available"}</dd></div></dl>{salon.rejectionReason && <p className="admin-rejection-note"><strong>Previous rejection:</strong> {salon.rejectionReason}</p>}<div className="admin-entity-actions">{salon.status === "Requested" && <><button className="admin-success-button" disabled={busyId === salon.id} onClick={() => void action(salon, "accept")}><Check size={15} /> Accept</button><button className="admin-danger-outline" disabled={busyId === salon.id} onClick={() => setRejecting(salon)}><X size={15} /> Reject</button></>}{salon.blockedByAdmin ? <button className="admin-secondary-button" disabled={busyId === salon.id} onClick={() => void action(salon, "unblock")}><RefreshCw size={15} /> Unblock</button> : salon.status !== "DELETED" && <button className="admin-danger-outline" disabled={busyId === salon.id} onClick={() => void action(salon, "block")}><Ban size={15} /> Block</button>}</div></article>)}</div>}{rejecting && <RejectSalonDialog salonName={rejecting.name} busy={busyId === rejecting.id} onClose={() => setRejecting(null)} onConfirm={reject} />}</div>;
}

function Status({ value }: { value: string }) { return <span className={`admin-status-badge ${value.toLowerCase()}`}>{value}</span>; }
