import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS, formatKes, statusTone } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  head: () => ({
    meta: [
      { title: "Assistance requests — Lift1 admin" },
      {
        name: "description",
        content:
          "Review assistance requests on need, record a decision and publish the update to the member.",
      },
      { property: "og:title", content: "Assistance requests — Lift1 admin" },
      { property: "og:description", content: "Needs-based review of assistance requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRequests,
});

type RequestRow = {
  id: string;
  member: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  approved: number | null;
  county: string | null;
  place: string;
  status: string;
  notes: string | null;
  created_at: string;
  sample: boolean;
};

function AdminRequests() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [approved, setApproved] = useState("");

  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async (): Promise<RequestRow[]> => {
      const [real, sample] = await Promise.all([
        supabase.from("assistance_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_requests").select("*").order("created_at", { ascending: false }),
      ]);
      if (real.error) throw real.error;
      if (sample.error) throw sample.error;
      return [
        ...(real.data ?? []).map((r) => ({
          id: r.id,
          member: "Member account",
          category: r.category,
          title: r.title,
          description: r.description,
          amount: Number(r.amount_requested),
          approved: r.approved_amount === null ? null : Number(r.approved_amount),
          county: r.county,
          place: r.county ?? "—",
          status: r.status,
          notes: r.review_notes,
          created_at: r.created_at,
          sample: false,
        })),
        ...(sample.data ?? []).map((r) => ({
          id: r.id,
          member: r.member_name,
          category: r.category,
          title: r.title,
          description: r.description,
          amount: Number(r.amount_requested),
          approved: r.approved_amount === null ? null : Number(r.approved_amount),
          county: r.county,
          place: [r.village, r.ward, r.subcounty].filter(Boolean).join(", ") || r.county,
          status: r.status,
          notes: r.review_notes,
          created_at: r.created_at,
          sample: true,
        })),
      ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    },
  });

  const save = useMutation({
    mutationFn: async (row: RequestRow) => {
      const payload = {
        status,
        review_notes: notes || null,
        approved_amount: approved === "" ? null : Number(approved),
      };
      const { error } = row.sample
        ? await supabase.from("demo_requests").update(payload).eq("id", row.id)
        : await supabase.from("assistance_requests").update(payload).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      setOpenId(null);
      toast.success("Decision saved and the member will see the update.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save decision"),
  });

  function startReview(row: RequestRow) {
    setOpenId(row.id);
    setStatus(row.status);
    setNotes(row.notes ?? "");
    setApproved(row.approved === null ? "" : String(row.approved));
  }

  const rows = (requests.data ?? []).filter((r) => filter === "ALL" || r.status === filter);

  return (
    <AdminShell
      title="Assistance requests"
      subtitle="Assess genuine need against published criteria. No draws, no winners."
    >
      <div className="flex flex-wrap gap-2">
        {["ALL", ...REQUEST_STATUSES].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                : "rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            }
          >
            {value === "ALL" ? "All" : (REQUEST_STATUS_LABELS[value] ?? value)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 && (
          <p className="surface-card p-5 text-sm text-muted-foreground">
            No requests in this status.
          </p>
        )}
        {rows.map((row) => (
          <div key={row.id} className="surface-card p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{row.title}</p>
                  {row.sample && <Badge variant="outline">Sample</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.member} · {row.category} · {row.place} ·{" "}
                  {new Date(row.created_at).toLocaleDateString("en-KE")}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone(row.status)}`}
              >
                {REQUEST_STATUS_LABELS[row.status] ?? row.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{row.description}</p>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Requested </span>
              <span className="font-semibold">{formatKes(row.amount)}</span>
              {row.approved !== null && (
                <>
                  <span className="text-muted-foreground"> · approved </span>
                  <span className="font-semibold">{formatKes(row.approved)}</span>
                </>
              )}
            </p>

            {openId === row.id ? (
              <div className="mt-4 space-y-3 rounded-2xl bg-muted/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUEST_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {REQUEST_STATUS_LABELS[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Approved amount (KSh)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={approved}
                      onChange={(e) => setApproved(e.target.value)}
                      placeholder="Leave empty if none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Update for the member
                  </Label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explain the decision or what is still needed."
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="sm:w-auto"
                    disabled={!status || save.isPending}
                    onClick={() => save.mutate(row)}
                  >
                    Save decision
                  </Button>
                  <Button variant="ghost" onClick={() => setOpenId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="mt-4 w-full sm:w-auto"
                variant="outline"
                onClick={() => startReview(row)}
              >
                Review this request
              </Button>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
