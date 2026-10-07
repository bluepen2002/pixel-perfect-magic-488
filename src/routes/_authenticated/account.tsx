import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { COUNTIES } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Lift1" },
      { name: "description", content: "Update your Lift1 profile details and contact information." },
      { property: "og:title", content: "My account — Lift1" },
      { property: "og:description", content: "Manage your Lift1 member details." },
    ],
  }),
  component: Account,
});

function Account() {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data ?? null;
    },
  });

  useEffect(() => {
    if (!profile.data) return;
    setFirstName(profile.data.first_name ?? "");
    setLastName(profile.data.last_name ?? "");
    setPhone(profile.data.phone ?? "");
    setCounty(profile.data.county ?? "");
    setTown(profile.data.town ?? "");
  }, [profile.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        county: county || null,
        town: town || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Your details have been saved.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  return (
    <AppShell>
      <p className="eyebrow">My account</p>
      <h1 className="mt-1.5 text-2xl font-extrabold text-primary sm:text-3xl">Your member details</h1>

      <div className="surface-card mt-5 max-w-xl sm:p-7 space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Verification status</span>
          <Badge variant="secondary">
            {profile.data?.verification_status === "VERIFIED" ? "Verified" : "Pending verification"}
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Phone number">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="County">
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Town">
            <Input value={town} onChange={(e) => setTown(e.target.value)} />
          </Field>
        </div>

        <Button size="lg" className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>
          Save changes
        </Button>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
