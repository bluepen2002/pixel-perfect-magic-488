import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brand } from "@/components/lift1/Brand";
import { Button } from "@/components/ui/button";
import { formatKes } from "@/lib/lift1";
import { supabase } from "@/integrations/supabase/client";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Transparency,
});

function Transparency() {
  const { data: stats, isLoading } = useCommunityStats();
  const { isAuthenticated } = useAuth();

  const sections = useQuery({
    queryKey: ["transparency-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transparency_content")
        .select("id, title, body, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const stories = useQuery({
    queryKey: ["impact-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_stories")
        .select("id, title, body, county, person_label, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
          Money contributed by the community is tracked separately from Lift1's operating business
          revenue. Nothing is deducted from contributions unless it is disclosed here.
        </p>

        <div className="surface-card mt-8 divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 p-4 sm:p-5"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="stat-number text-lg sm:text-xl">
                {isLoading ? "—" : row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(sections.data ?? []).map((section) => (
            <div key={section.id} className="surface-card p-5">
              <h2 className="text-base font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>

        {(stories.data ?? []).length > 0 && (
          <section className="mt-10">
            <p className="eyebrow">Impact stories</p>
            <h2 className="mt-2 text-2xl font-bold">Lives the community has lifted</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Shared with each person's consent. Names are never published.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(stories.data ?? []).map((story) => (
                <article key={story.id} className="surface-card p-5">
                  <h3 className="text-base font-semibold">{story.title}</h3>
                  {(story.person_label || story.county) && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {[story.person_label, story.county].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{story.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
