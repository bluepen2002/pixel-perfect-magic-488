import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { LIFT1, RECURRENCE_LABELS, REQUEST_STATUS_LABELS, formatKes, statusTone } from "@/lib/lift1";
import { toast } from "sonner";
import { useState } from "react";
import { ReceiptDialog, type ReceiptContribution } from "@/components/lift1/ReceiptDialog";
import { WelcomeSlides } from "@/components/lift1/WelcomeSlides";

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

  const [receipt, setReceipt] = useState<ReceiptContribution | null>(null);
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
      <h1 className="mt-1.5 text-2xl font-extrabold text-primary sm:text-3xl">
        Karibu{profile.data?.first_name ? `, ${profile.data.first_name}` : ""}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{LIFT1.philosophy}</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard label="Community fund" value={formatKes(stats?.total_contributed)} highlight />
        <StatCard label="People being lifted" value={String(stats?.people_lifted ?? 0)} />
        <StatCard label="Community members" value={String(stats?.members ?? 0)} />
        <StatCard label="My contributions" value={formatKes(myTotal)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-accent p-5 text-accent-foreground">
          <div>
            <h2 className="text-lg font-extrabold">Lift someone today</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Give from {formatKes(LIFT1.baseContribution)}. Every shilling is recorded.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/contribute">Contribute</Link>
          </Button>
        </div>
        <div className="surface-card flex flex-col justify-between gap-4 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">Need a lift?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you're facing. Requests are reviewed on need, never chance.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/request">Request a lift</Link>
          </Button>
        </div>
      </div>

      <div className="surface-card mt-5 flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div>
          <h2 className="text-lg font-semibold">Invite a friend</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The community grows one person at a time. Share Lift1 with someone you know.
          </p>
        </div>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={shareLift1}>
          Share Lift1
        </Button>
      </div>

      <section className="mt-7">
        <h2 className="text-lg font-extrabold text-primary">My assistance requests</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap a request to follow the review and see the outcome.
        </p>
        <div className="surface-card mt-3 divide-y divide-border">
          {(mine.data?.requests ?? []).length === 0 && (
            <p className="p-4 text-sm text-muted-foreground sm:p-5">No requests yet.</p>
          )}
          {(mine.data?.requests ?? []).map((r) => (
            <Link
              key={r.id}
              to="/requests/$id"
              params={{ id: r.id }}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.category} · {formatKes(r.amount_requested)} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-KE")}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone(r.status)}`}
              >
                {REQUEST_STATUS_LABELS[r.status] ?? r.status}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-lg font-extrabold text-primary">My contribution history</h2>
        <div className="surface-card mt-3 divide-y divide-border">
          {(mine.data?.contributions ?? []).length === 0 && (
            <p className="p-4 text-sm text-muted-foreground sm:p-5">No contributions yet.</p>
          )}
          {(mine.data?.contributions ?? []).map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setReceipt(c)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50 sm:p-5"
            >
              <div>
                <p className="font-semibold">{formatKes(c.amount_kes)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString("en-KE")} · Tap for receipt
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {c.recurrence && c.recurrence !== "ONE_TIME" && (
                  <Badge variant="secondary">{RECURRENCE_LABELS[c.recurrence] ?? c.recurrence}</Badge>
                )}
                <Badge variant="outline">{c.status === "RECORDED" ? "Recorded" : c.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      </section>
      <ReceiptDialog contribution={receipt} onClose={() => setReceipt(null)} />
      <WelcomeSlides />
    </AppShell>
  );
}

async function shareLift1() {
  const url = window.location.origin;
  const text = "Join me on Lift1 — one shilling at a time, we lift a life. " + url;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Lift1 — Lift a Life", text, url });
      return;
    } catch {
      return; // user dismissed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied — send it to a friend.");
  } catch {
    toast.error("Could not share. Copy the address from your browser instead.");
  }
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
          ? "flex aspect-[4/3] flex-col justify-between rounded-3xl bg-primary p-5 text-primary-foreground"
          : "surface-card flex aspect-[4/3] flex-col justify-between p-5"
      }
    >
      <p
        className={
          highlight
            ? "text-[0.65rem] font-bold uppercase tracking-widest text-primary-foreground/70"
            : "text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground"
        }
      >
        {label}
      </p>
      <p className="stat-number mt-2 text-2xl">{value}</p>
    </div>
  );
}
