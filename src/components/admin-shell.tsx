"use client";

import { BarChart3, LayoutDashboard, LogOut, Menu, Store, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/salons", label: "Salons", icon: Store },
  { href: "/users", label: "Users", icon: UsersRound },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      {open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-logo">
          <span>SH</span>
          <div><strong>SalonHub</strong><small>Administration</small></div>
          <button className="admin-sidebar-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav aria-label="Admin navigation">
          <p className="admin-nav-label">Workspace</p>
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link className={`admin-nav-item ${active ? "is-active" : ""}`} href={href} key={href} onClick={() => setOpen(false)}>
                <Icon size={17} /><span>{label}</span>{active && <i />}
              </Link>
            );
          })}
          <p className="admin-nav-label admin-nav-label-spaced">Insights</p>
          <div className="admin-nav-item is-disabled" title="Requires future backend analytics endpoints">
            <BarChart3 size={17} /><span>Analytics</span><b>Soon</b>
          </div>
        </nav>
        <button className="admin-signout" onClick={signOut} disabled={signingOut}>
          <LogOut size={16} /><span>{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div className="admin-breadcrumb"><span>SalonHub</span><i>/</i><strong>{navigation.find((item) => item.href === pathname)?.label ?? "Administration"}</strong></div>
          <div className="admin-top-actions">
            <div className="admin-top-avatar">AD</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
