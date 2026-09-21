import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { formatKes, statusTone, REQUEST_STATUS_LABELS } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Lift1" },
      {
        name: "description",
        content: "Community fund totals, members, contributions and assistance requests at a glance.",
      },
      { property: "og:title", content: "Admin overview — Lift1" },
      { property: "og:description", content: "Lift1 administration overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useCommunityStats();

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [members, sampleMembers, sampleContribs, requests, sampleRequests] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("demo_members").select("id", { count: "exact", head: true }),
        supabase.from("demo_contributions").select("amount_kes"),
        supabase.from("assistance_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_requests").select("*").order("created_at", { ascending: false }),
      ]);
      const sampleTotal = (sampleContribs.data ?? []).reduce(
        (sum, c) => sum + Number(c.amount_kes),
        0,
      );
      const queue = [
        ...(requests.data ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          member: "Member account",
          amount: Number(r.amount_requested),
          status: r.status,
          county: r.county,
          sample: false,
        })),
        ...(sampleRequests.data ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          member: r.member_name,
          amount: Number(r.amount_requested),
          status: r.status,
          county: r.county,
          sample: true,
        })),
      ];
      return {
        memberCount: members.count ?? 0,
        sampleMemberCount: sampleMembers.count ?? 0,
        sampleTotal,
        queue,
        pending: queue.filter((q) =>
          ["SUBMITTED", "UNDER_REVIEW", "NEEDS_MORE_INFO"].includes(q.status),
        ).length,
      };
    },
  });

  const cards = [
    { label: "Community fund", value: formatKes(stats?.total_contributed), highlight: true },
    { label: "Registered members", value: String(overview.data?.memberCount ?? 0) },
    { label: "Requests awaiting review", value: String(overview.data?.pending ?? 0) },
    { label: "Assistance sent", value: formatKes(stats?.total_disbursed) },
  ];

  return (
    <AdminShell
      title="Overview"
      subtitle="Everything the community has given, and everyone still waiting for a decision."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={
              card.highlight
                ? "rounded-2xl bg-gradient-lift p-5 text-primary-foreground shadow-lift"
                : "surface-card p-5"
            }
          >
            <p
              className={
                card.highlight
                  ? "text-[0.65rem] font-bold uppercase tracking-widest text-primary-foreground/80"
                  : "text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground"
              }
            >
              {card.label}
            </p>
            <p className="stat-number mt-2 text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="surface-card mt-4 p-5 text-sm text-muted-foreground">
        Sample community data is included so the dashboards are not empty:{" "}
        {overview.data?.sampleMemberCount ?? 0} sample members and{" "}
        {formatKes(overview.data?.sampleTotal)} of sample contributions. Sample rows are labelled
        everywhere and are kept out of the public community totals.
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Review queue</h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/requests">Open requests</Link>
          </Button>
        </div>
        <div className="surface-card mt-3 divide-y divide-border">
          {(overview.data?.queue ?? []).length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No requests yet.</p>
          )}
          {(overview.data?.queue ?? []).slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.member} · {formatKes(item.amount)}
                  {item.county ? ` · ${item.county}` : ""}
                  {item.sample ? " · sample" : ""}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status)}`}
              >
                {REQUEST_STATUS_LABELS[item.status] ?? item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
