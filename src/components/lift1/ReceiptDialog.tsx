import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LIFT1, RECURRENCE_LABELS, formatKes } from "@/lib/lift1";
import { toast } from "sonner";

export type ReceiptContribution = {
  id: string;
  amount_kes: number;
  created_at: string;
  recurrence?: string | null;
  status: string;
};

export function ReceiptDialog({
  contribution,
  onClose,
}: {
  contribution: ReceiptContribution | null;
  onClose: () => void;
}) {
  const c = contribution;
  const date = c ? new Date(c.created_at).toLocaleDateString("en-KE", { dateStyle: "long" }) : "";
  const ref = c ? c.id.slice(0, 8).toUpperCase() : "";

  async function share() {
    if (!c) return;
    const text = `I just gave ${formatKes(c.amount_kes)} to the Lift1 community fund. ${LIFT1.philosophy} ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Lift1 contribution", text });
      } catch {
        /* dismissed */
      }
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success("Thank-you message copied");
  }

  function saveImage() {
    if (!c) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1E6B4A";
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = "#F2A93B";
    ctx.beginPath();
    ctx.arc(900, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FAF6EE";
    ctx.font = "bold 56px Sora, sans-serif";
    ctx.fillText("Lift1", 90, 150);
    ctx.font = "40px Manrope, sans-serif";
    ctx.fillText("Thank you for lifting a life", 90, 420);
    ctx.font = "bold 150px Sora, sans-serif";
    ctx.fillText(formatKes(c.amount_kes), 90, 600);
    ctx.font = "36px Manrope, sans-serif";
    ctx.fillText(date, 90, 700);
    ctx.fillText(`Receipt ${ref}`, 90, 760);
    ctx.font = "32px Manrope, sans-serif";
    ctx.fillText(LIFT1.philosophy, 90, 980);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `lift1-receipt-${ref}.png`;
    a.click();
  }

  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Your receipt</DialogTitle>
        </DialogHeader>
        {c && (
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <p className="font-display text-lg font-extrabold">Lift1</p>
            <p className="mt-6 text-sm opacity-80">Thank you for lifting a life</p>
            <p className="font-display text-4xl font-extrabold">{formatKes(c.amount_kes)}</p>
            <p className="mt-2 text-sm opacity-80">
              {date}
              {c.recurrence && c.recurrence !== "ONE_TIME" ? ` · ${RECURRENCE_LABELS[c.recurrence]}` : ""}
            </p>
            <p className="text-sm opacity-80">Receipt {ref} · {c.status === "RECORDED" ? "Pledge recorded" : c.status}</p>
            <p className="mt-6 text-xs opacity-80">{LIFT1.philosophy}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={saveImage}>
            Save image
          </Button>
          <Button className="flex-1" onClick={share}>
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
