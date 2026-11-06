import {
  ArrowRight,
  BarChart3,
  Building2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const modules = [
  { icon: BarChart3, label: "Platform analytics" },
  { icon: Building2, label: "Salon approvals" },
  { icon: UsersRound, label: "User management" },
  { icon: ShieldCheck, label: "Trust & moderation" },
];

export default function HomePage() {
  return (
    <main className="admin-foundation">
      <section className="admin-foundation-card">
        <div className="admin-brand">
          <div className="admin-logo-mark" aria-hidden="true">SH</div>
          <div>
            <span>SalonHub</span>
            <strong>Administration</strong>
          </div>
        </div>

        <div className="admin-copy">
          <span className="admin-eyebrow">
            <Sparkles size={14} /> Design workspace ready
          </span>
          <h1>A calm command center for the entire SalonHub platform.</h1>
          <p>
            The Next.js and TypeScript foundation is ready for the approved v0
            interface. Backend integration will follow after design review.
          </p>
        </div>

        <div className="admin-module-grid">
          {modules.map(({ icon: Icon, label }) => (
            <article key={label}>
              <Icon size={19} />
              <span>{label}</span>
            </article>
          ))}
        </div>

        <div className="admin-next-step">
          <span>Next step</span>
          <strong>Generate and approve the complete admin experience in v0.</strong>
          <ArrowRight size={19} />
        </div>
      </section>
    </main>
  );
}

