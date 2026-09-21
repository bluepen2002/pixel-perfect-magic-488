import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatKes } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/admin/contributions")({
  head: () => ({
    meta: [
      { title: "Contributions — Lift1 admin" },
      {
        name: "description",
        content: "Every contribution recorded into the Lift1 community fund, with method and date.",
      },
      { property: "og:title", content: "Contributions — Lift1 admin" },
      { property: "og:description", content: "Contribution ledger for the community fund." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminContributions,
});

function AdminContributions() {
  const data = useQuery({
    queryKey: ["admin-contributions"],
    queryFn: async () => {
      const [real, sample] = await Promise.all([
        supabase.from("contributions").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_contributions").select("*").order("created_at", { ascending: false }),
      ]);
      if (real.error) throw real.error;
      if (sample.error) throw sample.error;
      const rows = [
        ...(real.data ?? []).map((c) => ({
          id: c.id,
          who: "Member account",
          amount: Number(c.amount_kes),
          method: c.method,
          status: c.status,
          county: "—",
          reference: c.reference,
          created_at: c.created_at,
          sample: false,
        })),
        ...(sample.data ?? []).map((c) => ({
          id: c.id,
          who: c.member_name,
          amount: Number(c.amount_kes),
          method: c.method,
          status: "RECORDED",
          county: c.county,
          reference: c.reference,
          created_at: c.created_at,
          sample: true,
        })),
      ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      const realTotal = (real.data ?? []).reduce((s, c) => s + Number(c.amount_kes), 0);
      const sampleTotal = (sample.data ?? []).reduce((s, c) => s + Number(c.amount_kes), 0);
      return { rows, realTotal, sampleTotal };
    },
  });

  return (
    <AdminShell
      title="Contributions"
      subtitle="The full ledger. Community money is tracked separately from business revenue."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="surface-card p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
            Real member contributions
          </p>
          <p className="stat-number mt-2 text-2xl">{formatKes(data.data?.realTotal)}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
            Sample data (not counted publicly)
          </p>
          <p className="stat-number mt-2 text-2xl">{formatKes(data.data?.sampleTotal)}</p>
        </div>
      </div>

      <div className="surface-card mt-4 divide-y divide-border">
        {(data.data?.rows ?? []).length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">No contributions recorded yet.</p>
        )}
        {(data.data?.rows ?? []).map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{formatKes(row.amount)}</p>
                {row.sample && <Badge variant="outline">Sample</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {row.who} · {row.county} · {new Date(row.created_at).toLocaleString("en-KE")}
              </p>
            </div>
            <div className="text-xs text-muted-foreground sm:text-right">
              <p className="font-semibold text-foreground">{row.method}</p>
              <p>
                {row.status}
                {row.reference ? ` · ${row.reference}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
