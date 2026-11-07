/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft, Ban, Check, Clock3, ExternalLink, Mail, MapPin, Phone, RefreshCw, Store, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ErrorBanner, LoadingState, RejectSalonDialog, Toast } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { AdminUser, Salon } from "@/types/admin";

export default function SalonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [team, setTeam] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [salonData, teamData] = await Promise.all([adminRequest<Salon>(`salons/${id}`), adminRequest<AdminUser[]>(`salons/${id}/team`)]);
      setSalon(salonData); setTeam(teamData);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function action(operation: "accept" | "block" | "unblock") {
    if (!salon) return;
    setBusy(true);
    try {
      await adminRequest(operation === "accept" ? "salons/requested/accept" : `salons/${salon.id}/${operation}`, { method: "POST", body: operation === "accept" ? JSON.stringify({ salonId: salon.id }) : undefined });
      setToast({ message: operation === "accept" ? `${salon.name} was approved.` : `${salon.name} was ${operation}ed.`, tone: "success" }); await load();
    } catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusy(false); }
  }

  async function reject(reason: string) {
    if (!salon) return;
    setBusy(true);
    try { await adminRequest("salons/requested/reject", { method: "POST", body: JSON.stringify({ salonId: salon.id, rejectionReason: reason }) }); setToast({ message: `${salon.name} was rejected and the owner was notified.`, tone: "success" }); setRejecting(false); await load(); }
    catch (requestError) { setToast({ message: errorMessage(requestError), tone: "error" }); }
    finally { setBusy(false); }
  }

  // Remote salon media URLs are validated and stored by the SalonHub backend.
  return <div className="admin-content">
    {toast && <Toast {...toast} onClose={() => setToast(null)} />}<Link className="admin-back-link" href="/salons"><ArrowLeft size={15} /> Back to salons</Link>{error && <ErrorBanner message={error} onRetry={() => void load()} />}
    {loading || !salon ? <LoadingState label="Loading salon information…" /> : <>
      <section className="admin-salon-hero"><div className="admin-salon-cover">{salon.profilePictureUrl ? <img src={salon.profilePictureUrl} alt={`${salon.name} profile`} /> : <Store size={34} />}</div><div className="admin-salon-title"><p className="admin-kicker">Salon #{salon.id}</p><div><h1>{salon.name}</h1><span className={`admin-status-badge ${(salon.blockedByAdmin ? "blocked" : salon.status).toLowerCase()}`}>{salon.blockedByAdmin ? "Blocked" : salon.status}</span></div><p><MapPin size={14} /> {salon.location ?? "Location not provided"}</p></div><div className="admin-salon-actions">{salon.status === "Requested" && <><button className="admin-success-button" disabled={busy} onClick={() => void action("accept")}><Check size={15} /> Accept request</button><button className="admin-danger-outline" disabled={busy} onClick={() => setRejecting(true)}><X size={15} /> Reject</button></>}{salon.blockedByAdmin ? <button className="admin-secondary-button" disabled={busy} onClick={() => void action("unblock")}><RefreshCw size={15} /> Unblock salon</button> : salon.status !== "DELETED" && <button className="admin-danger-outline" disabled={busy} onClick={() => void action("block")}><Ban size={15} /> Block salon</button>}</div></section>
      <section className="admin-detail-grid">
        <article className="admin-panel admin-detail-panel"><h2>Salon information</h2><div className="admin-detail-list"><Detail icon={Mail} label="Salon email" value={salon.email} /><Detail icon={Phone} label="Salon phone" value={salon.salonPhoneNumber} /><Detail icon={Clock3} label="Working hours" value={salon.openingTime && salon.closingTime ? `${salon.openingTime} – ${salon.closingTime}` : null} /><Detail icon={UsersRound} label="Team capacity" value={`${salon.currentEmployeesNumber ?? 0} of ${salon.maxEmployeesNumber ?? "—"} employees`} /><Detail icon={MapPin} label="Location" value={salon.location} /></div>{salon.googleMapsUrl && <a className="admin-map-link" href={salon.googleMapsUrl} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={14} /></a>}</article>
        <article className="admin-panel admin-detail-panel"><div className="admin-profile-panel-heading"><h2>Owner information</h2>{salon.ownerId && <Link className="admin-text-button" href={`/people/${salon.ownerId}`}>View profile <ExternalLink size={13} /></Link>}</div><div className="admin-detail-list"><Detail icon={UsersRound} label="Owner" value={salon.ownerName} /><Detail icon={Phone} label="Owner phone" value={salon.ownerPhoneNumber} /><Detail icon={Store} label="Opening status" value={salon.openningStatus} /><Detail icon={RefreshCw} label="Resubmissions" value={`${salon.resubmissionCount} used · ${salon.remainingResubmissions} remaining`} /></div></article>
        <article className="admin-panel admin-detail-panel admin-description-panel"><h2>About this salon</h2><p>{salon.description || "The owner has not added a salon description yet."}</p>{salon.rejectionReason && <div className="admin-rejection-note"><strong>Latest rejection reason:</strong> {salon.rejectionReason}</div>}</article>
        <article className="admin-panel admin-detail-panel admin-description-panel"><div className="admin-profile-panel-heading"><div><h2>Salon team</h2><p>{team.length} team {team.length === 1 ? "member" : "members"}</p></div><UsersRound size={18} /></div>{team.length ? <div className="admin-team-grid">{team.map((member) => <Link href={`/people/${member.id}`} key={member.id} className="admin-team-card"><span>{(member.firstName?.[0] ?? member.userName?.[0] ?? member.email[0]).toUpperCase()}</span><div><strong>{[member.firstName, member.lastName].filter(Boolean).join(" ") || member.userName || "Unnamed team member"}</strong><small>{member.email}</small><em className={`admin-status-badge ${member.status.toLowerCase()}`}>{member.status}</em></div><ExternalLink size={14} /></Link>)}</div> : <p className="admin-profile-empty">No salon team members are currently assigned.</p>}</article>
      </section>
    </>}
    {rejecting && salon && <RejectSalonDialog salonName={salon.name} busy={busy} onClose={() => setRejecting(false)} onConfirm={reject} />}
  </div>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: string | null | undefined }) { return <div className="admin-detail-row"><span><Icon size={15} /></span><div><small>{label}</small><strong>{value || "Not provided"}</strong></div></div>; }
