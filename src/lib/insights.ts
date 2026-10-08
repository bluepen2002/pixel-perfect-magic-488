// Small pure helpers used by the transparency breakdown and admin review queue.

export const OPEN_REQUEST_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "NEEDS_MORE_INFO"];
export const OVERDUE_DAYS = 7;

export function daysWaiting(createdAt: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function isOverdue(status: string, createdAt: string, now: Date = new Date()): boolean {
  return OPEN_REQUEST_STATUSES.includes(status) && daysWaiting(createdAt, now) >= OVERDUE_DAYS;
}

export function fundBreakdown(totalIn: number | null | undefined, totalOut: number | null | undefined) {
  const contributed = Number(totalIn ?? 0);
  const sent = Math.min(Number(totalOut ?? 0), contributed);
  const held = Math.max(0, contributed - sent);
  const sentPct = contributed > 0 ? Math.round((sent / contributed) * 100) : 0;
  return { contributed, sent, held, sentPct, heldPct: contributed > 0 ? 100 - sentPct : 0 };
}
