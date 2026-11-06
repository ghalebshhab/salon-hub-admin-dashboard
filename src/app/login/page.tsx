"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { adminRequest, errorMessage } from "@/lib/admin-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!email.trim() || !password) return setError("Enter your admin email and password.");
    setLoading(true);
    try {
      await adminRequest<{ token: string; type: string }>("login", { method: "POST", body: JSON.stringify({ adminEmail: email.trim(), adminPassword: password }) });
      router.replace("/"); router.refresh();
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }

  return <main className="admin-login-page"><section className="admin-login-story"><div className="admin-login-brand"><span>SH</span><div><strong>SalonHub</strong><small>Administration</small></div></div><div className="admin-login-copy"><p className="admin-kicker">Protected workspace</p><h1>Careful operations.<br />Beautiful outcomes.</h1><p>Review salons, support users, and keep the SalonHub community trustworthy from one secure command center.</p></div><div className="admin-login-assurance"><ShieldCheck size={18} /><span>Admin-only access protected by SalonHub permissions</span></div></section><section className="admin-login-form-panel"><form className="admin-login-form" onSubmit={submit}><div className="admin-login-icon"><LockKeyhole size={21} /></div><p className="admin-kicker">Welcome back</p><h2>Sign in to administration</h2><p>Use the credentials of an active SalonHub administrator.</p>{error && <div className="admin-login-error" role="alert">{error}</div>}<label htmlFor="adminEmail">Admin email</label><input id="adminEmail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@salonhub.com" /><label htmlFor="adminPassword">Password</label><div className="admin-password-field"><input id="adminPassword" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><button className="admin-primary-button admin-login-submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17} /> Signing you in…</> : "Sign in securely"}</button><small>Only accounts with the ADMIN role can access this application.</small></form></section></main>;
}
