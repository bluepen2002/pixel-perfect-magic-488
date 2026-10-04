import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/lift1/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { LIFT1, RECURRENCE_OPTIONS, formatKes } from "@/lib/lift1";

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
  const [recurrence, setRecurrence] = useState<string>("ONE_TIME");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contribute = useMutation({
    mutationFn: async (input: { value: number; recurrence: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("contributions").insert({
        user_id: user.id,
        amount_kes: input.value,
        status: "RECORDED",
        method: "PENDING_PROVIDER",
        recurrence: input.recurrence,
      });
      if (error) throw error;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["my-activity"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      toast.success(
        input.recurrence === "ONE_TIME"
          ? "Asante! Your contribution has been recorded."
          : "Asante! Your recurring giving pledge has been recorded.",
      );
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

      <div className="surface-card mt-5 max-w-xl p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {LIFT1.suggestedAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={
                amount === value
                  ? "min-h-11 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  : "min-h-11 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
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

        <div className="mt-5 space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How often
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {RECURRENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRecurrence(option.value)}
                className={
                  recurrence === option.value
                    ? "min-h-11 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                    : "min-h-11 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          {recurrence !== "ONE_TIME" && (
            <p className="text-xs text-muted-foreground">
              We'll record this as a recurring pledge and remind you each{" "}
              {recurrence === "WEEKLY" ? "week" : "month"}. You can change it anytime.
            </p>
          )}
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
          onClick={() => contribute.mutate({ value: amount, recurrence })}
        >
          Contribute {formatKes(amount || 0)}
          {recurrence === "WEEKLY" ? " weekly" : recurrence === "MONTHLY" ? " monthly" : ""}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Mobile money payment isn't connected yet, so contributions are recorded as pledges for
          now. Once M-Pesa details are added, this step will collect the payment.
        </p>
      </div>
    </AppShell>
  );
}
