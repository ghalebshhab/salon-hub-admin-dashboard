"use client";

import { ArrowLeft, BriefcaseBusiness, CalendarDays, ExternalLink, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorBanner, LoadingState } from "@/components/admin-ui";
import { adminRequest, errorMessage } from "@/lib/admin-api";
import type { UserProfile } from "@/types/admin";

type PersonProfileProps = { endpoint: string; backHref: string; backLabel: string; adminProfile?: boolean };

export function PersonProfile({ endpoint, backHref, backLabel, adminProfile = false }: PersonProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setProfile(await adminRequest<UserProfile>(endpoint)); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  if (loading) return <div className="admin-content"><LoadingState label="Loading profile…" /></div>;
  if (error || !profile) return <div className="admin-content"><Link className="admin-back-link" href={backHref}><ArrowLeft size={15} /> {backLabel}</Link><ErrorBanner message={error || "Profile information is unavailable."} onRetry={() => void load()} /></div>;

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.userName || "Unnamed account";
  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}` || profile.userName?.[0] || profile.email[0];

  return <div className="admin-content">
    <Link className="admin-back-link" href={backHref}><ArrowLeft size={15} /> {backLabel}</Link>
    <section className="admin-person-hero">
      <div className="admin-person-avatar">{initials.toUpperCase()}</div>
      <div className="admin-person-title"><p className="admin-kicker">{adminProfile ? "Administrator profile" : `Account #${profile.id}`}</p><h1>{fullName}</h1><div><span className="admin-profile-role"><ShieldCheck size={13} /> {profile.role}</span><span className={`admin-status-badge ${profile.status.toLowerCase()}`}>{profile.status}</span>{profile.careerProfileEnabled && <span className="admin-profile-career"><BriefcaseBusiness size={12} /> Career profile</span>}</div></div>
      <button className="admin-outline-button" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button>
    </section>

    <section className="admin-profile-grid">
      <article className="admin-panel admin-profile-panel"><h2>Account information</h2><div className="admin-detail-list"><ProfileDetail icon={UserRound} label="Username" value={profile.userName} /><ProfileDetail icon={Mail} label="Email address" value={profile.email} /><ProfileDetail icon={Phone} label="Phone number" value={profile.phoneNumber} /><ProfileDetail icon={CalendarDays} label="Date of birth" value={profile.dateOfBirth} /></div></article>
      <article className="admin-panel admin-profile-panel"><h2>Salon relationships</h2>{profile.ownedSalonId || profile.salonId ? <div className="admin-profile-relations">{profile.ownedSalonId && <Link href={`/salons/${profile.ownedSalonId}`}><Store size={18} /><span><small>Owned salon · {profile.ownedSalonStatus ?? "Unknown status"}</small><strong>{profile.ownedSalonName ?? "Salon"}</strong></span><ExternalLink size={14} /></Link>}{profile.salonId && <Link href={`/salons/${profile.salonId}`}><BriefcaseBusiness size={18} /><span><small>Team member at</small><strong>{profile.salonName ?? "Salon"}</strong></span><ExternalLink size={14} /></Link>}</div> : <p className="admin-profile-empty">This account is not currently connected to a salon.</p>}</article>

      <article className="admin-panel admin-profile-panel admin-profile-career-panel"><div className="admin-profile-panel-heading"><div><h2>Career profile</h2><p>{profile.careerProfileEnabled ? `${profile.careerProfileCompletionPercentage}% profile completion` : "Career mode is not enabled"}</p></div>{profile.careerProfileEnabled && <div className="admin-profile-completion"><i style={{ width: `${profile.careerProfileCompletionPercentage}%` }} /></div>}</div>{profile.careerProfileEnabled ? <><div className="admin-profile-career-meta"><ProfileDetail icon={BriefcaseBusiness} label="Experience" value={profile.yearsOfExperience == null ? null : `${profile.yearsOfExperience} years`} /><ProfileDetail icon={MapPin} label="Preferred locations" value={profile.preferredWorkLocations.join(", ")} /></div><div className="admin-profile-section"><small>Skills</small><div className="admin-skill-list">{profile.skills.length ? profile.skills.map((skill) => <span key={skill}>{skill}</span>) : <span>No skills provided</span>}</div></div><div className="admin-profile-section"><small>Professional biography</small><p>{profile.professionalBio || "No professional biography provided."}</p></div><div className="admin-profile-links">{profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer">Open résumé <ExternalLink size={13} /></a>}{profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Open portfolio <ExternalLink size={13} /></a>}</div></> : <p className="admin-profile-empty">This user has not converted their account to a career profile.</p>}</article>
    </section>
  </div>;
}

function ProfileDetail({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string | null | undefined }) {
  return <div className="admin-detail-row"><span><Icon size={15} /></span><div><small>{label}</small><strong>{value || "Not provided"}</strong></div></div>;
}
