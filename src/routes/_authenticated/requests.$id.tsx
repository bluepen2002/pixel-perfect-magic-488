import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { StatusTimeline } from "@/components/lift1/StatusTimeline";
import { supabase } from "@/integrations/supabase/client";
import { REQUEST_STATUS_LABELS, formatKes, statusTone } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/requests/$id")({
  head: () => ({
    meta: [
      { title: "Request updates — Lift1" },
      {
        name: "description",
        content: "Follow the review of your assistance request and see the outcome.",
      },
      { property: "og:title", content: "Request updates — Lift1" },
      { property: "og:description", content: "Track your Lift1 assistance request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestDetail,
});

function RequestDetail() {
  const { id } = useParams({ from: "/_authenticated/requests/$id" });

  const detail = useQuery({
    queryKey: ["request-detail", id],
    queryFn: async () => {
      const [request, events] = await Promise.all([
        supabase.from("assistance_requests").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("request_status_events")
          .select("*")
          .eq("request_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (request.error) throw request.error;
      if (events.error) throw events.error;
      return { request: request.data, events: events.data ?? [] };
    },
  });

  const request = detail.data?.request;

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/dashboard">← Back to my dashboard</Link>
      </Button>

      {!request && !detail.isLoading && (
        <p className="surface-card mt-4 p-5 text-sm text-muted-foreground">
          We couldn't find that request.
        </p>
      )}

      {request && (
        <>
          <p className="eyebrow mt-4">{request.category}</p>
          <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">{request.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(request.status)}`}
            >
              {REQUEST_STATUS_LABELS[request.status] ?? request.status}
            </span>
            <span className="text-xs text-muted-foreground">
              Submitted {new Date(request.created_at).toLocaleDateString("en-KE")}
            </span>
          </div>

          <div className="surface-card mt-5 space-y-3 p-4 sm:p-5">
            <Row label="Amount requested" value={formatKes(request.amount_requested)} />
            {request.approved_amount !== null && (
              <Row label="Amount approved" value={formatKes(request.approved_amount)} />
            )}
            {request.county && <Row label="County" value={request.county} />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your situation
              </p>
              <p className="mt-1 text-sm">{request.description}</p>
            </div>
            {request.review_notes && (
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Latest note from reviewers
                </p>
                <p className="mt-1 text-sm">{request.review_notes}</p>
              </div>
            )}
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Progress updates</h2>
            <div className="surface-card mt-3 p-4 sm:p-5">
              <StatusTimeline events={detail.data?.events ?? []} />
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
