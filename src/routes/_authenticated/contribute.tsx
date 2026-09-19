import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { LIFT1, formatKes } from "@/lib/lift1";

export const Route = createFileRoute("/_authenticated/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute — Lift1" },
      {
        name: "description",
        content: "Add a voluntary contribution to the Lift1 community fund, from one shilling up.",
      },
      { property: "og:title", content: "Contribute — Lift1" },
      { property: "og:description", content: "Give a shilling. Lift a life." },
    ],
  }),
  component: Contribute,
});

function Contribute() {
  const [amount, setAmount] = useState<number>(LIFT1.baseContribution);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contribute = useMutation({
    mutationFn: async (value: number) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("contributions").insert({
        user_id: user.id,
        amount_kes: value,
        status: "RECORDED",
        method: "PENDING_PROVIDER",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      toast.success("Asante! Your contribution has been recorded.");
      navigate({ to: "/dashboard" });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not record the contribution"),
  });

  return (
    <AppShell>
      <p className="eyebrow">Contribute</p>
      <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">Lift someone today</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Choose any amount. Contributions go to the community fund and are never counted as
        business revenue.
      </p>

      <div className="surface-card mt-6 max-w-xl p-6">
        <div className="flex flex-wrap gap-2">
          {LIFT1.suggestedAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={
                amount === value
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
              }
            >
              {formatKes(value)}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Or enter an amount ({LIFT1.currency})
          </Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="mt-6 rounded-2xl bg-muted p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your contribution</span>
            <span className="font-semibold">{formatKes(amount)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="font-semibold">
              {LIFT1.platformFeeEnabled ? `${LIFT1.platformFeePercentage}%` : formatKes(0)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">To the community fund</span>
            <span className="font-semibold">{formatKes(amount)}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={!amount || amount < 1 || contribute.isPending}
          onClick={() => contribute.mutate(amount)}
        >
          Contribute {formatKes(amount || 0)}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Mobile money payment isn't connected yet, so contributions are recorded as pledges for
          now. Once M-Pesa details are added, this step will collect the payment.
        </p>
      </div>
    </AppShell>
  );
}
