"use client";

import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Gem,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Salons", icon: Store },
  { label: "Users", icon: UsersRound },
  { label: "Bookings", icon: CalendarDays },
];

const pendingSalons = [
  ["Velvet & Vine", "Toronto, CA", "Oct 24, 2024"],
  ["Kumiko Studio", "Vancouver, CA", "Oct 23, 2024"],
  ["The Hair Room", "Austin, TX", "Oct 22, 2024"],
];

const trendBars = [42, 54, 48, 62, 58, 70, 67, 84, 75, 92, 81, 97];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      {sidebarOpen && <button className="admin-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-logo"><span>SH</span><div><strong>SalonHub</strong><small>Administration</small></div></div>
        <nav aria-label="Admin navigation">
          <p className="admin-nav-label">Workspace</p>
          {navItems.map(({ label, icon: Icon, active }) => <button className={`admin-nav-item ${active ? "is-active" : ""}`} key={label}><Icon size={17} /><span>{label}</span>{active && <i />}</button>)}
          <p className="admin-nav-label admin-nav-label-spaced">System</p>
          <button className="admin-nav-item"><ShieldCheck size={17} /><span>Moderation</span><b>4</b></button>
          <button className="admin-nav-item"><BarChart3 size={17} /><span>Analytics</span></button>
          <button className="admin-nav-item"><Settings size={17} /><span>Settings</span></button>
        </nav>
        <div className="admin-sidebar-footer"><div className="admin-avatar">AM</div><div><strong>Admin account</strong><small>Platform operations</small></div><ChevronDown size={15} /></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="admin-breadcrumb"><span>SalonHub</span><i>/</i><strong>Overview</strong></div>
          <div className="admin-top-actions"><button aria-label="Search"><Search size={18} /></button><button aria-label="Notifications" className="has-dot"><Bell size={18} /></button><div className="admin-top-avatar">AM</div></div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome"><div><p className="admin-kicker">Thursday, October 24, 2024</p><h1>Good morning, Admin.</h1><p className="admin-subtitle">Here&apos;s what&apos;s happening across SalonHub today.</p></div><button className="admin-outline-button"><CalendarDays size={16} /> Last 30 days <ChevronDown size={15} /></button></section>

          <section className="admin-stat-grid" aria-label="Platform overview">
            <StatCard icon={CircleDollarSign} label="Gross volume" value="$48,290" change="+12.8%" detail="vs. previous period" tone="plum" />
            <StatCard icon={CalendarDays} label="Bookings" value="2,840" change="+8.4%" detail="vs. previous period" tone="lilac" />
            <StatCard icon={Store} label="Active salons" value="1,248" change="+5.2%" detail="vs. previous period" tone="gold" />
            <StatCard icon={UsersRound} label="Total users" value="18,492" change="+14.1%" detail="vs. previous period" tone="blue" />
          </section>

          <section className="admin-main-grid">
            <article className="admin-panel admin-revenue-panel"><div className="admin-panel-heading"><div><h2>Revenue overview</h2><p>Platform earnings over time</p></div><button className="admin-icon-button" aria-label="Revenue options"><ChevronDown size={16} /></button></div><div className="admin-chart"><div className="admin-chart-y"><span>$6k</span><span>$4k</span><span>$2k</span><span>$0</span></div><div className="admin-chart-area"><div className="admin-grid-lines"><i /><i /><i /><i /></div><div className="admin-bars">{trendBars.map((height, index) => <span key={index} style={{ height: `${height}%` }} className={index === 9 ? "is-highlighted" : ""} />)}</div><div className="admin-chart-x"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span></div></div></div></article>
            <article className="admin-panel admin-activity-panel"><div className="admin-panel-heading"><div><h2>Recent activity</h2><p>Latest platform updates</p></div><button className="admin-text-button">View all <ArrowUpRight size={14} /></button></div><Activity icon={Store} title="New salon registered" detail="Luna Beauty Co. · 8 min ago" tone="plum" /><Activity icon={UserRound} title="New user joined" detail="Sofia Martinez · 24 min ago" tone="blue" /><Activity icon={CircleDollarSign} title="Payment received" detail="$245.00 · 1 hr ago" tone="gold" /><Activity icon={ShieldCheck} title="Salon verified" detail="Atelier No. 7 · 2 hrs ago" tone="green" /></article>
          </section>

          <section className="admin-bottom-grid">
            <article className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><h2>Pending salon approvals</h2><p>Review and verify new listings</p></div><button className="admin-text-button">View all <ArrowUpRight size={14} /></button></div><div className="admin-table-wrap"><table><thead><tr><th>Salon</th><th>Location</th><th>Submitted</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{pendingSalons.map(([salon, location, date]) => <tr key={salon}><td><div className="admin-salon-cell"><span>{salon.slice(0, 1)}</span><strong>{salon}</strong></div></td><td>{location}</td><td>{date}</td><td><em className="admin-status"><i />Pending</em></td><td><button className="admin-review-button">Review</button></td></tr>)}</tbody></table></div></article>
            <article className="admin-panel admin-spotlight"><div className="admin-spotlight-icon"><Gem size={18} /></div><p className="admin-kicker">Platform health</p><h2>Growing beautifully.</h2><p>SalonHub is helping more people find care they can trust. Keep the momentum going.</p><div className="admin-health-row"><span><i />All systems operational</span><strong>99.98%</strong></div></article>
          </section>

          <footer className="admin-footer"><span>SalonHub Administration</span><span>v1.0.0 · Internal use only</span></footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, detail, tone }: { icon: typeof Store; label: string; value: string; change: string; detail: string; tone: string }) {
  return <article className="admin-stat-card"><div className={`admin-stat-icon ${tone}`}><Icon size={18} /></div><div className="admin-stat-copy"><p>{label}</p><strong>{value}</strong><span><b>{change}</b> {detail}</span></div><Sparkles className="admin-stat-sparkle" size={15} /></article>;
}

function Activity({ icon: Icon, title, detail, tone }: { icon: typeof Store; title: string; detail: string; tone: string }) {
  return <div className="admin-activity"><span className={`admin-activity-icon ${tone}`}><Icon size={15} /></span><div><strong>{title}</strong><p>{detail}</p></div><Clock3 size={14} /> </div>;
}
