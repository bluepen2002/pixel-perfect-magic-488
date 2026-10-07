import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/lift1/AppShell";
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
import { COUNTIES, REQUEST_CATEGORIES } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/request")({
  head: () => ({
    meta: [
      { title: "Request a lift — Lift1" },
      {
        name: "description",
        content:
          "Submit a needs-based assistance request for medical, school fees, rent, food or emergency support.",
      },
      { property: "og:title", content: "Request a lift — Lift1" },
      { property: "og:description", content: "Tell the community what you're facing." },
    ],
  }),
  component: RequestLift,
});

function RequestLift() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [county, setCounty] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("assistance_requests").insert({
        user_id: user.id,
        category,
        title,
        description,
        amount_requested: Number(amount),
        county: county || null,
        status: "SUBMITTED",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      toast.success("Your request has been submitted for review.");
      navigate({ to: "/dashboard" });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not submit the request"),
  });

  const valid = category && title.trim() && description.trim().length > 20 && Number(amount) > 0;

  return (
    <AppShell>
      <p className="eyebrow">Request a lift</p>
      <h1 className="mt-1.5 text-2xl font-extrabold text-primary sm:text-3xl">Tell us what you're facing</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Requests are reviewed against clear need and priority criteria. Please be honest and
        specific — it helps reviewers understand your situation.
      </p>

      <form
        className="surface-card mt-5 max-w-xl sm:p-7 space-y-4 p-4 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Choose the type of need" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Short summary
          </Label>
          <Input
            placeholder="e.g. Hospital bill for my daughter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your situation
          </Label>
          <Textarea
            rows={6}
            placeholder="Explain what happened, what you need, and how the assistance would be used."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least a few sentences, please.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amount needed (KSh)
            </Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              County
            </Label>
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
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!valid || submit.isPending}>
          Submit request
        </Button>
        <p className="text-xs text-muted-foreground">
          Assistance is needs-based. There is no draw and no winner — reviewers assess genuine
          need. You can add supporting documents once document upload is switched on.
        </p>
      </form>
    </AppShell>
  );
}
