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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Brand />
        <div className="flex items-center gap-2">
          <Link to="/transparency" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            Transparency
          </Link>
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to="/dashboard">My dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-4 lg:grid-cols-2 lg:pt-10">
        <div>
          <p className="eyebrow">{LIFT1.tagline}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            One Shilling.
            <br />
            One Community.
            <br />
            <span className="text-primary">One Life at a Time.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            {LIFT1.secondary} Lift1 lets Kenyans give small amounts together, so verified
            neighbours in genuine hardship can be lifted.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={isAuthenticated ? "/contribute" : "/auth"}>
                Contribute {formatKes(LIFT1.baseContribution)}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={isAuthenticated ? "/request" : "/auth"}>Request a lift</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Needs-based assistance only. No prize draws, no winners, no gambling.
          </p>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="Kenyan community members standing together with hands joined"
            width={1600}
            height={1008}
            className="w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="surface-card absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-2 p-4 sm:left-8 sm:right-8">
            <Stat label="Contributed" value={formatKes(stats?.total_contributed ?? 0)} />
            <Stat label="Members" value={String(stats?.members ?? 0)} />
            <Stat label="Lifted" value={String(stats?.people_lifted ?? 0)} />
          </div>
        </div>
      </section>

      <HomeGallery />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16">
        <h2 className="text-2xl font-bold sm:text-3xl">How Lift1 works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <div key={step.title} className="surface-card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-secondary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-gradient-lift p-8 text-primary-foreground shadow-lift sm:p-12">
          <h2 className="max-w-xl text-2xl font-bold sm:text-3xl">
            Join the community that lifts.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
            Create an account, verify your details, and start with a single shilling.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              {isAuthenticated ? "Go to my dashboard" : "Get started"}
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-muted-foreground">
          <p>{LIFT1.philosophy}</p>
          <p>
            Lift1 keeps community funds separate from business operating revenue. Platform fee:{" "}
            {LIFT1.platformFeeEnabled ? `${LIFT1.platformFeePercentage}%` : "none"}.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="stat-number text-lg sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
