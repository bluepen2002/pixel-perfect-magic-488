import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { LIFT1, REQUEST_STATUS_LABELS, formatKes } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Lift1 dashboard" },
      {
        name: "description",
        content: "Your contributions, your assistance requests and today's community fund.",
      },
      { property: "og:title", content: "My Lift1 dashboard" },
      { property: "og:description", content: "Track your contributions and requests on Lift1." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useCommunityStats();

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (existing) return existing;
      const meta = user.user_metadata ?? {};
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          first_name: (meta['first_name'] as string) ?? (meta['name'] as string) ?? "",
          last_name: (meta['last_name'] as string) ?? "",
          phone: (meta['phone'] as string) ?? null,
          county: (meta['county'] as string) ?? null,
          town: (meta['town'] as string) ?? null,
        })
        .select()
        .maybeSingle();
      return created ?? null;
    },
  });

  const mine = useQuery({
    queryKey: ["my-activity"],
    queryFn: async () => {
      const [contributions, requests] = await Promise.all([
        supabase.from("contributions").select("*").order("created_at", { ascending: false }),
        supabase.from("assistance_requests").select("*").order("created_at", { ascending: false }),
      ]);
      if (contributions.error) throw contributions.error;
      if (requests.error) throw requests.error;
      return { contributions: contributions.data, requests: requests.data };
    },
  });

  const myTotal = (mine.data?.contributions ?? []).reduce(
    (sum, c) => sum + Number(c.amount_kes),
    0,
  );

  return (
    <AppShell>
      <p className="eyebrow">{LIFT1.tagline}</p>
      <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">
        Karibu{profile.data?.first_name ? `, ${profile.data.first_name}` : ""}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{LIFT1.philosophy}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Community fund" value={formatKes(stats?.total_contributed)} highlight />
        <StatCard label="People being lifted" value={String(stats?.people_lifted ?? 0)} />
        <StatCard label="Community members" value={String(stats?.members ?? 0)} />
        <StatCard label="My contributions" value={formatKes(myTotal)} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="surface-card flex flex-col justify-between gap-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Lift someone today</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Give from {formatKes(LIFT1.baseContribution)}. Every shilling is recorded.
            </p>
          </div>
          <Button asChild>
            <Link to="/contribute">Contribute</Link>
          </Button>
        </div>
        <div className="surface-card flex flex-col justify-between gap-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Need a lift?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you're facing. Requests are reviewed on need, never chance.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/request">Request a lift</Link>
          </Button>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">My assistance requests</h2>
        <div className="surface-card mt-3 divide-y divide-border">
          {(mine.data?.requests ?? []).length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No requests yet.</p>
          )}
          {(mine.data?.requests ?? []).map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.category} · {formatKes(r.amount_requested)} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-KE")}
                </p>
              </div>
              <Badge variant="secondary">{REQUEST_STATUS_LABELS[r.status] ?? r.status}</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">My contribution history</h2>
        <div className="surface-card mt-3 divide-y divide-border">
          {(mine.data?.contributions ?? []).length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No contributions yet.</p>
          )}
          {(mine.data?.contributions ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{formatKes(c.amount_kes)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString("en-KE")}
                </p>
              </div>
              <Badge variant="outline">{c.status === "RECORDED" ? "Recorded" : c.status}</Badge>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl bg-gradient-lift p-5 text-primary-foreground shadow-lift"
          : "surface-card p-5"
      }
    >
      <p
        className={
          highlight
            ? "text-[0.65rem] font-bold uppercase tracking-widest text-primary-foreground/80"
            : "text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground"
        }
      >
        {label}
      </p>
      <p className="stat-number mt-2 text-2xl">{value}</p>
    </div>
  );
}
