import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/lift1/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({
    meta: [
      { title: "Members — Lift1 admin" },
      {
        name: "description",
        content: "Review Lift1 members, their location and verification status.",
      },
      { property: "og:title", content: "Members — Lift1 admin" },
      { property: "og:description", content: "Manage Lift1 community members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMembers,
});

type Row = {
  id: string;
  name: string;
  phone: string | null;
  county: string | null;
  place: string;
  status: string;
  joined: string;
  sample: boolean;
};

function AdminMembers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const members = useQuery({
    queryKey: ["admin-members"],
    queryFn: async (): Promise<Row[]> => {
      const [real, sample] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("demo_members").select("*").order("joined_at", { ascending: false }),
      ]);
      if (real.error) throw real.error;
      if (sample.error) throw sample.error;
      return [
        ...(real.data ?? []).map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`.trim() || "Unnamed member",
          phone: p.phone,
          county: p.county,
          place: p.town ?? "—",
          status: p.verification_status,
          joined: p.created_at,
          sample: false,
        })),
        ...(sample.data ?? []).map((m) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          phone: m.phone,
          county: m.county,
          place: `${m.village}, ${m.ward} — ${m.subcounty}`,
          status: m.verification_status,
          joined: m.joined_at,
          sample: true,
        })),
      ];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ row, status }: { row: Row; status: string }) => {
      const table = row.sample ? "demo_members" : "profiles";
      const { error } = await supabase
        .from(table)
        .update({ verification_status: status })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      toast.success("Member verification updated.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update member"),
  });

  const term = search.trim().toLowerCase();
  const rows = (members.data ?? []).filter(
    (r) =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.county ?? "").toLowerCase().includes(term) ||
      r.place.toLowerCase().includes(term),
  );

  return (
    <AdminShell title="Members" subtitle="Verify members and check where they are based.">
      <Input
        placeholder="Search by name, county, ward or village"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="surface-card mt-4 divide-y divide-border">
        {rows.length === 0 && <p className="p-5 text-sm text-muted-foreground">No members found.</p>}
        {rows.map((row) => (
          <div key={row.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{row.name}</p>
              {row.sample && <Badge variant="outline">Sample</Badge>}
              <Badge variant={row.status === "VERIFIED" ? "default" : "secondary"}>
                {row.status.replace(/_/g, " ").toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.phone ?? "No phone"} · {row.county ?? "County not set"} · {row.place}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined {new Date(row.joined).toLocaleDateString("en-KE")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["VERIFIED", "UNDER_REVIEW", "PENDING", "REJECTED"].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={row.status === status ? "default" : "outline"}
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ row, status })}
                >
                  {status.replace(/_/g, " ").toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
