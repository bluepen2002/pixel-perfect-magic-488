import { REQUEST_STATUS_LABELS } from "@/lib/lift1";

export type StatusEvent = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

export function StatusTimeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No updates yet. You'll see every review step here.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {events.map((event, index) => (
        <li key={event.id} className="relative">
          <span
            className={
              index === 0
                ? "absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15"
                : "absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full bg-border"
            }
          />
          <p className="text-sm font-semibold">
            {REQUEST_STATUS_LABELS[event.status] ?? event.status}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.created_at).toLocaleString("en-KE")}
          </p>
          {event.note && <p className="mt-1.5 text-sm text-muted-foreground">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
