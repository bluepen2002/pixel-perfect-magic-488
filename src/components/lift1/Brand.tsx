import { Link } from "@tanstack/react-router";
import { LIFT1 } from "@/lib/lift1";

export function Brand({ to = "/" }: { to?: "/" | "/dashboard" | "/admin" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20V6" />
          <path d="M6 12l6-6 6 6" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-bold tracking-tight">{LIFT1.name}</span>
        <span className="block text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground">
          {LIFT1.tagline}
        </span>
      </span>
    </Link>
  );
}
