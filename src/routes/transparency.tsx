import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/components/lift1/Brand";
import { Button } from "@/components/ui/button";
import { LIFT1, formatKes } from "@/lib/lift1";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency — Lift1" },
      {
        name: "description",
        content:
          "See how the Lift1 community fund is built and used: total contributed, requests received, people lifted and amounts sent.",
      },
      { property: "og:title", content: "Transparency — Lift1" },
      {
        property: "og:description",
        content: "Open community numbers: contributions in, assistance out.",
      },
    ],
  }),
  component: Transparency,
});

function Transparency() {
  const { data: stats, isLoading } = useCommunityStats();
  const { isAuthenticated } = useAuth();

  const rows = [
    { label: "Total contributed by members", value: formatKes(stats?.total_contributed) },
    { label: "Number of contributions", value: String(stats?.contribution_count ?? 0) },
    { label: "Community members", value: String(stats?.members ?? 0) },
    { label: "Assistance requests received", value: String(stats?.requests_submitted ?? 0) },
    { label: "People lifted (approved or sent)", value: String(stats?.people_lifted ?? 0) },
    { label: "Assistance sent out", value: formatKes(stats?.total_disbursed) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
        <Brand />
        <Button asChild size="sm" variant="outline">
          <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
            {isAuthenticated ? "My dashboard" : "Sign in"}
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20">
        <p className="eyebrow">Transparency</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">The community numbers</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Money contributed by the community is tracked separately from Lift1's operating
          business revenue. Nothing is deducted from contributions unless it is disclosed here.
        </p>

        <div className="surface-card mt-8 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 p-5">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="stat-number text-xl">{isLoading ? "—" : row.value}</span>
            </div>
          ))}
        </div>

        <div className="surface-card mt-6 p-5 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">Fund principles</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Assistance is needs-based and reviewed against published criteria.</li>
            <li>No draws, winners or chance-based allocation of any kind.</li>
            <li>
              Platform fee is{" "}
              {LIFT1.platformFeeEnabled
                ? `${LIFT1.platformFeePercentage}% and shown on every contribution`
                : "switched off — 0% is taken from contributions"}
              .
            </li>
            <li>Every contribution and approved amount is recorded against a member account.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
