import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/community-hero.jpg";
import { Brand } from "@/components/lift1/Brand";
import { Button } from "@/components/ui/button";
import { LIFT1, formatKes } from "@/lib/lift1";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useAuth } from "@/hooks/useAuth";
import { useHomeMedia } from "@/hooks/useHomeMedia";

function HomeGallery() {
  const { data } = useHomeMedia();
  if (!data?.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <h2 className="text-2xl font-bold sm:text-3xl">From our community</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((m) => (
          <figure key={m.id} className="surface-card overflow-hidden">
            <div className="aspect-video bg-muted">
              {m.url &&
                (m.kind === "video" ? (
                  <video src={m.url} controls playsInline preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <img src={m.url} alt={m.caption ?? "Lift1 community"} loading="lazy" className="h-full w-full object-cover" />
                ))}
            </div>
            {m.caption && <figcaption className="p-4 text-sm text-muted-foreground">{m.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lift1 — Lift a life, one shilling at a time" },
      {
        name: "description",
        content:
          "Lift1 is a Kenyan community assistance platform. Contribute from KSh 1, and verified neighbours facing genuine hardship can receive needs-based help.",
      },
      { property: "og:title", content: "Lift1 — Lift a life, one shilling at a time" },
      {
        property: "og:description",
        content: "One Shilling. One Community. One Life at a Time.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    title: "Contribute what you can",
    body: "Small voluntary contributions, starting at one shilling, pooled into a community fund.",
  },
  {
    title: "Neighbours ask for help",
    body: "Members facing medical, school-fee, rent, food or emergency needs submit a request with supporting details.",
  },
  {
    title: "Needs-based review",
    body: "Requests are reviewed against clear eligibility and priority criteria. No draws, no winners, no chance.",
  },
  {
    title: "Everything is traceable",
    body: "Every contribution and every approved assistance amount is recorded and visible.",
  },
];

function Landing() {
  const { data: stats } = useCommunityStats();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Brand />
        <div className="flex items-center gap-3">
          <Link to="/transparency" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            Transparency
          </Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              {isAuthenticated ? "My dashboard" : "Sign in"}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {/* Hero tile */}
          <section className="col-span-2 rounded-3xl border border-primary/5 bg-card p-6 shadow-soft md:row-span-2 md:p-8">
            <span className="eyebrow">Community assistance</span>
            <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1] text-primary sm:text-4xl lg:text-5xl">
              One Shilling.
              <br />
              One Community.
              <br />
              One Life at a Time.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {LIFT1.secondary} Lift1 lets Kenyans give small amounts together to lift neighbours in genuine hardship.
            </p>
          </section>

          <StatTile
            dark
            label="Contributed"
            value={formatKes(stats?.total_contributed ?? 0)}
            icon={<path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 10s5 1.6 5 3.5S14.8 17 12 17s-5-1.1-5-3" />}
          />
          <StatTile
            label="Members"
            value={String(stats?.members ?? 0)}
            icon={<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-4.9" /></>}
          />

          {/* Image tile */}
          <div className="relative col-span-2 h-48 overflow-hidden rounded-3xl md:h-auto md:min-h-48">
            <img
              src={heroImage}
              alt="Kenyan community members standing together"
              width={1600}
              height={1008}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/85 to-transparent p-5">
              <div className="text-primary-foreground">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Our impact</p>
                <p className="font-display text-lg font-bold">
                  {stats?.people_lifted ?? 0} {stats?.people_lifted === 1 ? "life" : "lives"} lifted together
                </p>
              </div>
            </div>
          </div>

          {/* CTA tile */}
          <section className="col-span-2 rounded-3xl bg-accent p-6 md:col-span-4 md:flex md:items-center md:justify-between">
            <h2 className="mb-4 text-xl font-extrabold text-accent-foreground md:mb-0 md:text-2xl">Join the community</h2>
            <div className="flex gap-2 md:w-96">
              <Button asChild size="lg" className="flex-1 rounded-2xl">
                <Link to={isAuthenticated ? "/contribute" : "/auth"}>
                  Contribute {formatKes(LIFT1.baseContribution)}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1 rounded-2xl border-0 bg-card text-primary hover:bg-card/90">
                <Link to={isAuthenticated ? "/request" : "/auth"}>Request a lift</Link>
              </Button>
            </div>
          </section>
        </div>

        <HomeGallery />

        <section className="pt-10">
          <h2 className="px-1 text-xl font-extrabold text-primary sm:text-2xl">How Lift1 works</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:gap-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4 rounded-3xl border border-primary/5 bg-card p-6">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/10 bg-background text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-primary">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-[11px] leading-relaxed text-muted-foreground">
        <p>Needs-based assistance only. No prize draws, no winners, no gambling. {LIFT1.philosophy}</p>
        <p className="mt-1">
          Community funds are kept separate from business operating revenue. Platform fee:{" "}
          {LIFT1.platformFeeEnabled ? `${LIFT1.platformFeePercentage}%` : "none"}.
        </p>
      </footer>
    </div>
  );
}

function StatTile({ label, value, icon, dark }: { label: string; value: string; icon: ReactNode; dark?: boolean }) {
  return (
    <div
      className={`flex aspect-square flex-col justify-between rounded-3xl p-5 md:aspect-auto ${
        dark ? "bg-primary text-primary-foreground" : "border border-primary/5 bg-card"
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${dark ? "bg-primary-foreground/10 text-accent" : "bg-background text-primary"}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {icon}
        </svg>
      </span>
      <div className="mt-4">
        <p className="font-display text-2xl font-bold">{value}</p>
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? "opacity-60" : "text-muted-foreground"}`}>{label}</p>
      </div>
    </div>
  );
}
